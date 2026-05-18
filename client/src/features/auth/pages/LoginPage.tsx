import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { useLogin } from '../hooks/useAuth'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'

export const LoginPage: React.FC = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const { mutate: login, isPending } = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(form)
  }

  return (
    <Card className="animate-fadeIn">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">Sign in</h1>
      <p className="text-slate-400 text-sm mb-6">Welcome back to Life OS</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="login-email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <Input
          id="login-password"
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />

        <Button id="login-submit" type="submit" fullWidth loading={isPending} size="lg" className="mt-2">
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Create one
        </Link>
      </p>
    </Card>
  )
}
