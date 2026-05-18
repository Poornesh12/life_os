import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { financeApi } from '../api/financeApi'
import type { CreateTransactionRequest, TransactionType, UpdateTransactionRequest } from '../types/finance.types'

export const TRANSACTIONS_KEY = 'transactions'
export const DASHBOARD_KEY = 'dashboard'

export const useTransactions = (params?: { page?: number; type?: TransactionType }) => {
  return useQuery({
    queryKey: [TRANSACTIONS_KEY, params],
    queryFn: () => financeApi.getAll(params),
  })
}

export const useDashboard = () => {
  return useQuery({
    queryKey: [DASHBOARD_KEY],
    queryFn: financeApi.getDashboard,
  })
}

export const useMonthlySummary = (year: number, month: number) => {
  return useQuery({
    queryKey: ['monthly-summary', year, month],
    queryFn: () => financeApi.getMonthlySummary(year, month),
  })
}

export const useCreateTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => financeApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] })
      qc.invalidateQueries({ queryKey: [DASHBOARD_KEY] })
      toast.success('Transaction added')
    },
    onError: () => toast.error('Failed to add transaction'),
  })
}

export const useUpdateTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionRequest }) =>
      financeApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] })
      qc.invalidateQueries({ queryKey: [DASHBOARD_KEY] })
      toast.success('Transaction updated')
    },
    onError: () => toast.error('Failed to update transaction'),
  })
}

export const useDeleteTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: financeApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] })
      qc.invalidateQueries({ queryKey: [DASHBOARD_KEY] })
      toast.success('Transaction deleted')
    },
    onError: () => toast.error('Failed to delete transaction'),
  })
}
