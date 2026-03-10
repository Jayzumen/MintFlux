import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  RecurringTransaction,
  RecurringTransactionChange,
} from "@/src/types/transaction";

const serializeChanges = (
  changes: RecurringTransactionChange[],
): object[] => {
  return changes.map((change) => ({
    ...change,
    effectiveDate: Timestamp.fromDate(change.effectiveDate),
  }));
};

const deserializeChanges = (raw: any[]): RecurringTransactionChange[] => {
  if (!raw) return [];
  return raw.map((change) => ({
    ...change,
    effectiveDate: change.effectiveDate.toDate(),
  }));
};

export const getEffectiveValues = (
  recurring: RecurringTransaction,
  forDate: Date,
): { amount: number; type: "income" | "expense"; category: string; description: string } => {
  let { amount, type, category, description } = recurring;

  if (recurring.changes?.length) {
    const sorted = [...recurring.changes].sort(
      (a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime(),
    );
    for (const change of sorted) {
      if (change.effectiveDate <= forDate) {
        if (change.amount !== undefined) amount = change.amount;
        if (change.type !== undefined) type = change.type;
        if (change.category !== undefined) category = change.category;
        if (change.description !== undefined) description = change.description;
      }
    }
  }

  return { amount, type, category, description };
};

export const addRecurringTransaction = async (
  userId: string,
  data: Omit<RecurringTransaction, "id" | "userId" | "createdAt" | "updatedAt">,
) => {
  try {
    const { changes, ...rest } = data;
    const docRef = await addDoc(collection(db, "recurringTransactions"), {
      ...rest,
      userId,
      startDate: Timestamp.fromDate(data.startDate),
      endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
      lastProcessedDate: data.lastProcessedDate
        ? Timestamp.fromDate(data.lastProcessedDate)
        : null,
      changes: changes ? serializeChanges(changes) : [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateRecurringTransaction = async (
  id: string,
  data: Partial<Omit<RecurringTransaction, "id" | "userId" | "createdAt">>,
) => {
  try {
    const docRef = doc(db, "recurringTransactions", id);
    const { changes, ...rest } = data;
    const updateData: any = {
      ...rest,
      updatedAt: Timestamp.now(),
    };

    if (data.startDate) {
      updateData.startDate = Timestamp.fromDate(data.startDate);
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate
        ? Timestamp.fromDate(data.endDate)
        : null;
    }
    if (data.lastProcessedDate !== undefined) {
      updateData.lastProcessedDate = data.lastProcessedDate
        ? Timestamp.fromDate(data.lastProcessedDate)
        : null;
    }
    if (changes !== undefined) {
      updateData.changes = serializeChanges(changes);
    }

    await updateDoc(docRef, updateData);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const addChangeToRecurringTransaction = async (
  id: string,
  existingChanges: RecurringTransactionChange[],
  newChange: RecurringTransactionChange,
) => {
  const filtered = existingChanges.filter(
    (c) => c.effectiveDate.getTime() !== newChange.effectiveDate.getTime(),
  );
  const updatedChanges = [...filtered, newChange].sort(
    (a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime(),
  );
  return updateRecurringTransaction(id, { changes: updatedChanges });
};

export const deleteRecurringTransaction = async (id: string) => {
  try {
    await deleteDoc(doc(db, "recurringTransactions", id));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const subscribeToRecurringTransactions = (
  userId: string,
  callback: (recurringTransactions: RecurringTransaction[]) => void,
) => {
  const q = query(
    collection(db, "recurringTransactions"),
    where("userId", "==", userId),
    orderBy("startDate", "desc"),
  );

  return onSnapshot(q, (snapshot) => {
    const recurringTransactions: RecurringTransaction[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      recurringTransactions.push({
        id: doc.id,
        ...data,
        startDate: data.startDate.toDate(),
        endDate: data.endDate?.toDate(),
        lastProcessedDate: data.lastProcessedDate?.toDate(),
        changes: deserializeChanges(data.changes),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as RecurringTransaction);
    });
    callback(recurringTransactions);
  });
};

export const getRecurringTransactions = async (
  userId: string,
): Promise<RecurringTransaction[]> => {
  try {
    const q = query(
      collection(db, "recurringTransactions"),
      where("userId", "==", userId),
      where("isActive", "==", true),
    );

    const snapshot = await getDocs(q);
    const recurringTransactions: RecurringTransaction[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      recurringTransactions.push({
        id: doc.id,
        ...data,
        startDate: data.startDate.toDate(),
        endDate: data.endDate?.toDate(),
        lastProcessedDate: data.lastProcessedDate?.toDate(),
        changes: deserializeChanges(data.changes),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as RecurringTransaction);
    });

    return recurringTransactions;
  } catch (error) {
    console.error("Error getting recurring transactions:", error);
    return [];
  }
};

// Helper function to calculate the next occurrence date
export const getNextOccurrenceDate = (
  startDate: Date,
  frequency: "weekly" | "monthly" | "yearly",
  lastProcessedDate?: Date,
): Date => {
  const baseDate = lastProcessedDate || startDate;
  const nextDate = new Date(baseDate);

  switch (frequency) {
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "yearly":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }

  return nextDate;
};

// Helper function to check if a recurring transaction should be processed
export const shouldProcessRecurringTransaction = (
  recurringTransaction: RecurringTransaction,
  currentDate: Date = new Date(),
): boolean => {
  // Check if the recurring transaction is active
  if (!recurringTransaction.isActive) {
    return false;
  }

  // Check if we've reached the end date
  if (
    recurringTransaction.endDate &&
    currentDate > recurringTransaction.endDate
  ) {
    return false;
  }

  // Calculate the next occurrence date
  const nextOccurrenceDate = getNextOccurrenceDate(
    recurringTransaction.startDate,
    recurringTransaction.frequency,
    recurringTransaction.lastProcessedDate,
  );

  // Check if the current date is past or equal to the next occurrence date
  return currentDate >= nextOccurrenceDate;
};
