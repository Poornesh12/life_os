import { apiClient } from '@/shared/services/apiClient'
import type { ApiSuccess } from '@/shared/types/api.types'
import type {
  CreateHabitRequest,
  Habit,
  HabitLog,
  HabitStats,
  LogHabitRequest,
  UpdateHabitRequest,
} from '../types/habits.types'

export const habitsApi = {
  create: async (data: CreateHabitRequest) => {
    const res = await apiClient.post<ApiSuccess<Habit>>('/habits', data)
    return res.data.data
  },

  getAll: async () => {
    const res = await apiClient.get<ApiSuccess<Habit[]>>('/habits')
    return res.data.data
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiSuccess<Habit>>(`/habits/${id}`)
    return res.data.data
  },

  update: async (id: string, data: UpdateHabitRequest) => {
    const res = await apiClient.put<ApiSuccess<Habit>>(`/habits/${id}`, data)
    return res.data.data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/habits/${id}`)
  },

  logHabit: async (id: string, data: LogHabitRequest) => {
    const res = await apiClient.post<ApiSuccess<HabitLog>>(`/habits/${id}/logs`, data)
    return res.data.data
  },

  getLogs: async (id: string, limit = 30) => {
    const res = await apiClient.get<ApiSuccess<HabitLog[]>>(`/habits/${id}/logs`, {
      params: { limit },
    })
    return res.data.data
  },

  getStats: async (id: string) => {
    const res = await apiClient.get<ApiSuccess<HabitStats>>(`/habits/${id}/stats`)
    return res.data.data
  },
}
