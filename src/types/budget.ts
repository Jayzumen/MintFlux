export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetFormData {
  category: string;
  limit: number;
  period: 'monthly' | 'weekly' | 'yearly';
}