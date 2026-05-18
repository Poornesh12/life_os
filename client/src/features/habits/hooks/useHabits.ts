import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { habitsApi } from '../api/habitsApi'
import type { CreateHabitRequest, LogHabitRequest, UpdateHabitRequest } from '../types/habits.types'

export const HABITS_KEY = 'habits'

export const useHabits = () => {
  return useQuery({
    queryKey: [HABITS_KEY],
    queryFn: habitsApi.getAll,
  })
}

export const useHabitStats = (habitId: string) => {
  return useQuery({
    queryKey: ['habit-stats', habitId],
    queryFn: () => habitsApi.getStats(habitId),
    enabled: !!habitId,
  })
}

export const useCreateHabit = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateHabitRequest) => habitsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [HABITS_KEY] })
      toast.success('Habit created!')
    },
    onError: () => toast.error('Failed to create habit'),
  })
}

export const useUpdateHabit = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHabitRequest }) =>
      habitsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [HABITS_KEY] })
      toast.success('Habit updated')
    },
    onError: () => toast.error('Failed to update habit'),
  })
}

export const useDeleteHabit = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: habitsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [HABITS_KEY] })
      toast.success('Habit deleted')
    },
    onError: () => toast.error('Failed to delete habit'),
  })
}

export const useLogHabit = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ habitId, data }: { habitId: string; data: LogHabitRequest }) =>
      habitsApi.logHabit(habitId, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [HABITS_KEY] })
      qc.invalidateQueries({ queryKey: ['habit-stats', vars.habitId] })
      toast.success('Habit logged! 🎉')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Already logged today'
      toast.error(msg)
    },
  })
}
