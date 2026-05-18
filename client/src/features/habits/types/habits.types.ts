// ─── Habits Types ─────────────────────────────────────────────────────────────

export interface Habit {
  id: string
  user_id: string
  name: string
  description: string
  color: string
  icon: string
  target_days: number[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateHabitRequest {
  name: string
  description?: string
  color?: string
  icon?: string
  target_days?: number[]
}

export interface UpdateHabitRequest {
  name?: string
  description?: string
  color?: string
  icon?: string
  target_days?: number[]
  is_active?: boolean
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_date: string
  notes?: string
  created_at: string
}

export interface LogHabitRequest {
  completed_date: string
  notes?: string
}

export interface HabitStats {
  habit_id: string
  name: string
  current_streak: number
  longest_streak: number
  total_completions: number
  completion_rate_7d: number
  completion_rate_30d: number
}
