import { Outlet } from 'react-router-dom'
import { Zap } from 'lucide-react'

export const AuthLayout: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4">
    {/* Background glow */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl" />
    </div>

    <div className="relative w-full max-w-md">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/30">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold gradient-text">Life OS</span>
      </div>

      <Outlet />
    </div>
  </div>
)
