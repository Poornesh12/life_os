import { useState } from 'react'
import { Plus, Trash2, Pencil, Filter } from 'lucide-react'
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
} from '../hooks/useTransactions'
import { Card, CardHeader } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { PageLoader } from '@/shared/components/Spinner'
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type CreateTransactionRequest,
  type ExpenseCategory,
  type TransactionType,
} from '../types/finance.types'

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as ExpenseCategory[]
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const EMPTY_FORM: CreateTransactionRequest = {
  type: 'expense',
  category: 'food',
  amount: 0,
  description: '',
  date: new Date().toISOString().slice(0, 16),
}

export const FinancePage: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>()
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateTransactionRequest>(EMPTY_FORM)

  const { data, isLoading } = useTransactions({ page, type: typeFilter })
  const { mutate: create, isPending: creating } = useCreateTransaction()
  const { mutate: deleteT } = useDeleteTransaction()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    create(
      { ...form, date: new Date(form.date).toISOString() },
      {
        onSuccess: () => {
          setShowForm(false)
          setForm(EMPTY_FORM)
        },
      },
    )
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Finance</h1>
          <p className="text-slate-400 text-sm mt-1">Track your income and expenses</p>
        </div>
        <Button id="add-transaction-btn" onClick={() => setShowForm(true)} size="md">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card>
          <CardHeader title="New Transaction" action={
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300 text-sm">Cancel</button>
          } />
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Type</label>
              <select
                id="txn-type"
                className="w-full rounded-xl border border-slate-700 bg-surface-800 text-slate-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TransactionType }))}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Category</label>
              <select
                id="txn-category"
                className="w-full rounded-xl border border-slate-700 bg-surface-800 text-slate-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <Input
              id="txn-amount"
              label="Amount (₹)"
              type="number"
              min={0.01}
              step={0.01}
              value={form.amount || ''}
              onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) }))}
              required
            />
            <Input
              id="txn-date"
              label="Date"
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
            <div className="sm:col-span-2">
              <Input
                id="txn-description"
                label="Description"
                placeholder="e.g. Lunch at work"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button id="txn-submit" type="submit" loading={creating}>Save Transaction</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        {([undefined, 'income', 'expense'] as const).map((f) => (
          <button
            key={String(f)}
            onClick={() => { setTypeFilter(f); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === f
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-700'
            }`}
          >
            {f === undefined ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <Card padding="sm">
        {data?.data.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <p className="text-3xl mb-3">💳</p>
            <p className="font-medium">No transactions yet</p>
            <p className="text-sm mt-1">Click "Add Transaction" to get started</p>
          </div>
        ) : (
          <div>
            {data?.data.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 last:border-0 hover:bg-surface-800/50 transition-colors rounded-xl">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-lg"
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
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${txn.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </span>
                  <button
                    onClick={() => deleteT(txn.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {data && data.total_pages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4 pb-2">
                <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</Button>
                <span className="text-sm text-slate-500">Page {page} of {data.total_pages}</span>
                <Button variant="ghost" size="sm" disabled={page === data.total_pages} onClick={() => setPage((p) => p + 1)}>Next →</Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
