export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'transfer' | 'credit' | 'other';

export interface Transaction {
  id: string;
  userId: string;
  userEmail?: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  paymentMethod?: PaymentMethod;
  createdAt?: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  transactionCount: number;
  highestExpenseCategory: { name: string; amount: number } | null;
}
