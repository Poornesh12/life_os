import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { AppLayout } from '@/app/layouts/AppLayout'
import { ProtectedRoute, PublicRoute } from '@/shared/components/ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { DashboardPage } from '@/features/finance/pages/DashboardPage'
import { FinancePage } from '@/features/finance/pages/FinancePage'
import { HabitsPage } from '@/features/habits/pages/HabitsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        ),
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/finance', element: <FinancePage /> },
      { path: '/habits', element: <HabitsPage /> },
    ],
  },
])
