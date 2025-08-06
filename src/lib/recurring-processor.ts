import {
  getRecurringTransactions,
  getNextOccurrenceDate,
  updateRecurringTransaction,
} from "./recurring-transactions";
import { addTransaction } from "./transactions";

export class RecurringTransactionProcessor {
  private static instance: RecurringTransactionProcessor;
  private processing = false;

  private constructor() {}

  static getInstance(): RecurringTransactionProcessor {
    if (!RecurringTransactionProcessor.instance) {
      RecurringTransactionProcessor.instance =
        new RecurringTransactionProcessor();
    }
    return RecurringTransactionProcessor.instance;
  }

  async processRecurringTransactions(userId: string): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    try {
      const recurringTransactions = await getRecurringTransactions(userId);
      const currentDate = new Date();

      for (const recurringTransaction of recurringTransactions) {
        let nextDate = getNextOccurrenceDate(
          recurringTransaction.startDate,
          recurringTransaction.frequency,
          recurringTransaction.lastProcessedDate,
        );

        while (
          recurringTransaction.isActive &&
          (!recurringTransaction.endDate || nextDate <= currentDate) &&
          nextDate <= currentDate
        ) {
          // 1. Create the transaction for nextDate
          const transactionData = {
            amount: recurringTransaction.amount,
            type: recurringTransaction.type,
            category: recurringTransaction.category,
            description: recurringTransaction.description,
            date: nextDate,
          };
          await addTransaction(userId, transactionData);

          // 2. Update lastProcessedDate
          await updateRecurringTransaction(recurringTransaction.id, {
            lastProcessedDate: nextDate,
          });

          // 3. Prepare for next loop
          recurringTransaction.lastProcessedDate = nextDate;
          nextDate = getNextOccurrenceDate(
            recurringTransaction.startDate,
            recurringTransaction.frequency,
            recurringTransaction.lastProcessedDate,
          );

          // 4. Deactivate if endDate reached
          if (
            recurringTransaction.endDate &&
            nextDate > recurringTransaction.endDate
          ) {
            await updateRecurringTransaction(recurringTransaction.id, {
              isActive: false,
            });
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error in recurring transaction processing:", error);
    } finally {
      this.processing = false;
    }
  }

  // Method to start periodic processing (can be called from a background job)
  startPeriodicProcessing(
    userId: string,
    intervalMinutes: number = 60,
  ): NodeJS.Timeout {
    // Process immediately
    this.processRecurringTransactions(userId);

    // Then set up periodic processing
    return setInterval(
      () => {
        this.processRecurringTransactions(userId);
      },
      intervalMinutes * 60 * 1000,
    );
  }

  // Method to stop periodic processing
  stopPeriodicProcessing(intervalId: NodeJS.Timeout): void {
    clearInterval(intervalId);
  }
}

// Export a singleton instance
export const recurringProcessor = RecurringTransactionProcessor.getInstance();
