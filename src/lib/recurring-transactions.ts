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
import { RecurringTransaction } from "@/src/types/transaction";

export const addRecurringTransaction = async (
  userId: string,
  data: Omit<RecurringTransaction, "id" | "userId" | "createdAt" | "updatedAt">,
) => {
  try {
    const docRef = await addDoc(collection(db, "recurringTransactions"), {
      ...data,
      userId,
      startDate: Timestamp.fromDate(data.startDate),
      endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
      lastProcessedDate: data.lastProcessedDate
        ? Timestamp.fromDate(data.lastProcessedDate)
        : null,
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
    const updateData: any = {
      ...data,
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

    await updateDoc(docRef, updateData);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
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
