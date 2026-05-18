import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useDashboard } from '../hooks/useTransactions'
import { Card, CardHeader } from '@/shared/components/Card'
import { PageLoader } from '@/shared/components/Spinner'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../types/finance.types'
import type { ExpenseCategory } from '../types/finance.types'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useAuthStore } from '@/app/store/authStore'

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const StatCard: React.FC<{
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}> = ({ label, value, sub, icon, trend }) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-xl ${trend === 'up' ? 'bg-emerald-500/15 text-emerald-400' : trend === 'down' ? 'bg-red-500/15 text-red-400' : 'bg-indigo-500/15 text-indigo-400'}`}>
        {icon}
      </div>
    </div>
  </Card>
)

export const DashboardPage: React.FC = () => {
  const { data: dashboard, isLoading } = useDashboard()
  const user = useAuthStore((s) => s.user)

  if (isLoading) return <PageLoader />

  const d = dashboard

  const pieData = d?.top_categories.map((c) => ({
    name: CATEGORY_LABELS[c.category as ExpenseCategory] ?? c.category,
    value: c.total,
    color: CATEGORY_COLORS[c.category as ExpenseCategory] ?? '#6366f1',
  })) ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.username}</span> 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">Here's your financial overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Net Balance"
          value={formatCurrency(d?.net_balance ?? 0)}
          icon={<Wallet className="h-5 w-5" />}
          trend="neutral"
        />
        <StatCard
          label="Total Income"
          value={formatCurrency(d?.total_income ?? 0)}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(d?.total_expenses ?? 0)}
          icon={<TrendingDown className="h-5 w-5" />}
          trend="down"
        />
        <StatCard
          label="This Month"
          value={formatCurrency(d?.this_month_income ?? 0)}
          sub={`Spent: ${formatCurrency(d?.this_month_expenses ?? 0)}`}
          icon={<ArrowUpRight className="h-5 w-5" />}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories Pie */}
        <Card>
          <CardHeader title="Top Expense Categories" subtitle="This month" />
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => formatCurrency(Number(v))}
                  contentStyle={{ background: '#1a1a27', border: '1px solid #2d2d4a', borderRadius: 8 }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-slate-500 text-sm">
              No expense data yet
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                {d.name}
              </span>
            ))}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader title="Recent Transactions" />
          <div className="space-y-3">
            {d?.recent_transactions.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">No transactions yet</p>
            ) : (
              d?.recent_transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-base"
                      style={{ background: `${CATEGORY_COLORS[txn.category as ExpenseCategory]}20` }}
                    >
                      {txn.type === 'income' ? '💰' : '💸'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{txn.description}</p>
                      <p className="text-xs text-slate-500">
                        {CATEGORY_LABELS[txn.category as ExpenseCategory]} · {new Date(txn.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${txn.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
