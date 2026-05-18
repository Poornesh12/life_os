// ─── Finance Types ────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense'

export type ExpenseCategory =
  | 'food' | 'transport' | 'housing' | 'healthcare'
  | 'entertainment' | 'shopping' | 'education' | 'utilities'
  | 'savings' | 'investment' | 'salary' | 'freelance' | 'other'

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  category: ExpenseCategory
  amount: number
  description: string
  date: string
  created_at: string
  updated_at: string
}

export interface CreateTransactionRequest {
  type: TransactionType
  category: ExpenseCategory
  amount: number
  description: string
  date: string
}

export interface UpdateTransactionRequest {
  category?: ExpenseCategory
  amount?: number
  description?: string
  date?: string
}

export interface CategorySummary {
  category: string
  total: number
  count: number
}

export interface MonthlySummary {
  year: number
  month: number
  total_income: number
  total_expenses: number
  net: number
  by_category: CategorySummary[]
}

export interface DashboardAnalytics {
  total_income: number
  total_expenses: number
  net_balance: number
  this_month_income: number
  this_month_expenses: number
  top_categories: CategorySummary[]
  recent_transactions: Transaction[]
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: 'Food & Dining',
  transport: 'Transport',
  housing: 'Housing',
  healthcare: 'Healthcare',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  education: 'Education',
  utilities: 'Utilities',
  savings: 'Savings',
  investment: 'Investment',
  salary: 'Salary',
  freelance: 'Freelance',
  other: 'Other',
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: '#f97316',
  transport: '#3b82f6',
  housing: '#8b5cf6',
  healthcare: '#ec4899',
  entertainment: '#f59e0b',
  shopping: '#06b6d4',
  education: '#10b981',
  utilities: '#6366f1',
  savings: '#22c55e',
  investment: '#14b8a6',
  salary: '#84cc16',
  freelance: '#a855f7',
  other: '#64748b',
}
