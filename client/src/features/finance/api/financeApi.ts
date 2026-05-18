import { apiClient } from '@/shared/services/apiClient'
import type {
  ApiSuccess,
  PaginatedResponse,
} from '@/shared/types/api.types'
import type {
  CreateTransactionRequest,
  DashboardAnalytics,
  MonthlySummary,
  Transaction,
  TransactionType,
  UpdateTransactionRequest,
} from '../types/finance.types'

export const financeApi = {
  create: async (data: CreateTransactionRequest) => {
    const res = await apiClient.post<ApiSuccess<Transaction>>('/transactions', data)
    return res.data.data
  },

  getAll: async (params?: { page?: number; page_size?: number; type?: TransactionType }) => {
    const res = await apiClient.get<PaginatedResponse<Transaction>>('/transactions', { params })
    return res.data
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiSuccess<Transaction>>(`/transactions/${id}`)
    return res.data.data
  },

  update: async (id: string, data: UpdateTransactionRequest) => {
    const res = await apiClient.put<ApiSuccess<Transaction>>(`/transactions/${id}`, data)
    return res.data.data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/transactions/${id}`)
  },

  getDashboard: async () => {
    const res = await apiClient.get<ApiSuccess<DashboardAnalytics>>('/transactions/dashboard')
    return res.data.data
  },

  getMonthlySummary: async (year: number, month: number) => {
    const res = await apiClient.get<ApiSuccess<MonthlySummary>>('/transactions/summary/monthly', {
      params: { year, month },
    })
    return res.data.data
  },
}
