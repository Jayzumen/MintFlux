import {
  getRecurringTransactions,
  shouldProcessRecurringTransaction,
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
      let processedCount = 0;

      for (const recurringTransaction of recurringTransactions) {
        if (
          shouldProcessRecurringTransaction(recurringTransaction, currentDate)
        ) {
          try {
            // Create the new transaction
            const transactionData = {
              amount: recurringTransaction.amount,
              type: recurringTransaction.type,
              category: recurringTransaction.category,
              description: recurringTransaction.description,
              date: getNextOccurrenceDate(
                recurringTransaction.startDate,
                recurringTransaction.frequency,
                recurringTransaction.lastProcessedDate,
              ),
            };

            const { error } = await addTransaction(userId, transactionData);

            if (error) {
              console.error("Failed to create recurring transaction:", error);
              continue;
            }

            // Update the last processed date
            const nextOccurrenceDate = getNextOccurrenceDate(
              recurringTransaction.startDate,
              recurringTransaction.frequency,
              recurringTransaction.lastProcessedDate,
            );

            await updateRecurringTransaction(recurringTransaction.id, {
              lastProcessedDate: nextOccurrenceDate,
            });

            processedCount++;

            // Check if we've reached the end date
            if (
              recurringTransaction.endDate &&
              nextOccurrenceDate >= recurringTransaction.endDate
            ) {
              await updateRecurringTransaction(recurringTransaction.id, {
                isActive: false,
              });
            }
          } catch (error) {
            console.error("Error processing recurring transaction:", error);
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
