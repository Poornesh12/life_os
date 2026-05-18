import { useState } from 'react'
import { Plus, Flame, Trophy, CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { useHabits, useCreateHabit, useDeleteHabit, useLogHabit } from '../hooks/useHabits'
import { Card, CardHeader } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { PageLoader } from '@/shared/components/Spinner'
import type { CreateHabitRequest, Habit } from '../types/habits.types'

const EMOJI_OPTIONS = ['⚡', '💪', '📚', '🏃', '🧘', '💧', '🍎', '😴', '✍️', '🎯']
const COLOR_OPTIONS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4']

const EMPTY_FORM: CreateHabitRequest = {
  name: '',
  description: '',
  color: '#6366f1',
  icon: '⚡',
  target_days: [0, 1, 2, 3, 4, 5, 6],
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const HabitCard: React.FC<{ habit: Habit; onDelete: (id: string) => void; onLog: (id: string) => void; isLogging: boolean }> = ({
  habit, onDelete, onLog, isLogging,
}) => {
  const todayDay = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1 // 0=Mon

  return (
    <div className="glass rounded-2xl p-5 border border-slate-800/50 hover:border-indigo-500/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${habit.color}20` }}
          >
            {habit.icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">{habit.name}</h3>
            {habit.description && (
              <p className="text-xs text-slate-500 mt-0.5">{habit.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(habit.id)}
          className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Target days */}
      <div className="flex gap-1 mb-4">
        {DAY_LABELS.map((d, i) => (
          <div
            key={i}
            className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
              habit.target_days.includes(i)
                ? 'text-white'
                : 'bg-slate-800 text-slate-600'
            }`}
            style={habit.target_days.includes(i) ? { background: habit.color } : {}}
          >
            {d}
          </div>
        ))}
      </div>

      <Button
        id={`log-habit-${habit.id}`}
        onClick={() => onLog(habit.id)}
        loading={isLogging}
        fullWidth
        variant="secondary"
        size="sm"
        className="gap-2"
      >
        <CheckCircle2 className="h-4 w-4" style={{ color: habit.color }} />
        Mark Today Complete
      </Button>
    </div>
  )
}

export const HabitsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateHabitRequest>(EMPTY_FORM)
  const [loggingId, setLoggingId] = useState<string | null>(null)

  const { data: habits, isLoading } = useHabits()
  const { mutate: create, isPending: creating } = useCreateHabit()
  const { mutate: deleteH } = useDeleteHabit()
  const { mutate: logH } = useLogHabit()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    create(form, { onSuccess: () => { setShowForm(false); setForm(EMPTY_FORM) } })
  }

  const handleLog = (habitId: string) => {
    setLoggingId(habitId)
    logH(
      { habitId, data: { completed_date: new Date().toISOString() } },
      { onSettled: () => setLoggingId(null) },
    )
  }

  const toggleDay = (day: number) => {
    setForm((f) => ({
      ...f,
      target_days: f.target_days?.includes(day)
        ? f.target_days.filter((d) => d !== day)
        : [...(f.target_days ?? []), day].sort(),
    }))
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Habits</h1>
          <p className="text-slate-400 text-sm mt-1">Build consistency, one day at a time</p>
        </div>
        <Button id="add-habit-btn" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          New Habit
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card>
          <CardHeader title="Create Habit" action={
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300 text-sm">Cancel</button>
          } />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="habit-name"
                label="Habit name"
                placeholder="e.g. Morning Run"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <Input
                id="habit-description"
                label="Description (optional)"
                placeholder="e.g. Run 5km every morning"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Icon picker */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, icon: emoji }))}
                    className={`h-9 w-9 rounded-xl text-lg transition-all ${
                      form.icon === emoji ? 'ring-2 ring-indigo-500 bg-indigo-600/20' : 'bg-surface-700 hover:bg-surface-600'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Color</label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color }))}
                    className={`h-7 w-7 rounded-full transition-all ${form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-800' : ''}`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>

            {/* Target days */}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Target days</label>
              <div className="flex gap-2">
                {DAY_LABELS.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`h-9 w-9 rounded-xl text-sm font-medium transition-all ${
                      form.target_days?.includes(i)
                        ? 'text-white ring-2 ring-offset-1 ring-offset-surface-800'
                        : 'bg-surface-700 text-slate-400 hover:bg-surface-600'
                    }`}
                    style={form.target_days?.includes(i) ? { background: form.color } : {}}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button id="habit-submit" type="submit" loading={creating}>Create Habit</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Habits grid */}
      {habits?.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-5xl mb-4">🎯</p>
          <p className="text-lg font-medium text-slate-300">No habits yet</p>
          <p className="text-sm mt-2">Start building your routine by adding your first habit</p>
          <Button className="mt-6" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Add your first habit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits?.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onDelete={(id) => deleteH(id)}
              onLog={handleLog}
              isLogging={loggingId === habit.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
