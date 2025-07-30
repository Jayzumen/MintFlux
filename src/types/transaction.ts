export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  isRecurring?: boolean;
  recurringId?: string; // Reference to the recurring transaction template
}

export interface TransactionFormData {
  amount: number;
  type: "income" | "expense";
  category: string;
  description: string;
  date: Date;
  isRecurring?: boolean;
  recurringFrequency?: "weekly" | "monthly" | "yearly";
  recurringEndDate?: Date | null;
}

export interface RecurringTransaction {
  id: string;
  userId: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  description: string;
  startDate: Date;
  frequency: "weekly" | "monthly" | "yearly";
  endDate?: Date | null;
  isActive: boolean;
  lastProcessedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const EXPENSE_CATEGORIES = [
  "Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Travel",
  "Education",
  "Personal Care",
  "Groceries",
  "Rent/Mortgage",
  "Insurance",
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Business",
  "Side Hustle",
  "Gift",
  "Bonus",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
