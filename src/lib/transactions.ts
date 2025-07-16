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
import { Transaction, TransactionFormData } from "@/src/types/transaction";

export const addTransaction = async (
  userId: string,
  data: TransactionFormData,
) => {
  try {
    const docRef = await addDoc(collection(db, "transactions"), {
      ...data,
      userId,
      date: Timestamp.fromDate(data.date),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateTransaction = async (
  id: string,
  data: Partial<TransactionFormData>,
) => {
  try {
    const docRef = doc(db, "transactions", id);
    await updateDoc(docRef, {
      ...data,
      ...(data.date && { date: Timestamp.fromDate(data.date) }),
      updatedAt: Timestamp.now(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteTransaction = async (id: string) => {
  try {
    await deleteDoc(doc(db, "transactions", id));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const subscribeToTransactions = (
  userId: string,
  callback: (transactions: Transaction[]) => void,
) => {
  const q = query(
    collection(db, "transactions"),
    where("userId", "==", userId),
    orderBy("date", "desc"),
  );

  return onSnapshot(q, (snapshot) => {
    const transactions: Transaction[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Transaction);
    });
    callback(transactions);
  });
};

export const getTransactionsByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate)),
      orderBy("date", "desc"),
    );

    const snapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Transaction);
    });

    return transactions;
  } catch (error) {
    console.error("Error getting transactions:", error);
    return [];
  }
};
