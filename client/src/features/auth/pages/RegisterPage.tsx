import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, User } from 'lucide-react'
import { useRegister } from '../hooks/useAuth'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'

export const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const { mutate: register, isPending } = useRegister()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register(form)
  }

  return (
    <Card className="animate-fadeIn">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">Create account</h1>
      <p className="text-slate-400 text-sm mb-6">Start your journey with Life OS</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="register-email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <Input
          id="register-username"
          label="Username"
          type="text"
          placeholder="johndoe"
          leftIcon={<User className="h-4 w-4" />}
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          required
          minLength={3}
        />
        <Input
          id="register-password"
          label="Password"
          type="password"
          placeholder="Min 8 characters"
          leftIcon={<Lock className="h-4 w-4" />}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
          minLength={8}
        />

        <Button id="register-submit" type="submit" fullWidth loading={isPending} size="lg" className="mt-2">
          {isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Sign in
        </Link>
      </p>
    </Card>
  )
}
