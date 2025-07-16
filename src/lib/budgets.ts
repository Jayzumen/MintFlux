import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Budget, BudgetFormData } from "@/src/types/budget";

export const addBudget = async (userId: string, data: BudgetFormData) => {
  try {
    const docRef = await addDoc(collection(db, "budgets"), {
      ...data,
      userId,
      spent: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateBudget = async (
  id: string,
  data: Partial<BudgetFormData>,
) => {
  try {
    const docRef = doc(db, "budgets", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteBudget = async (id: string) => {
  try {
    await deleteDoc(doc(db, "budgets", id));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const subscribeToBudgets = (
  userId: string,
  callback: (budgets: Budget[]) => void,
) => {
  const q = query(collection(db, "budgets"), where("userId", "==", userId));

  return onSnapshot(q, (snapshot) => {
    const budgets: Budget[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      budgets.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Budget);
    });
    callback(budgets);
  });
};

export const updateBudgetSpent = async (budgetId: string, spent: number) => {
  try {
    const docRef = doc(db, "budgets", budgetId);
    await updateDoc(docRef, {
      spent,
      updatedAt: Timestamp.now(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
