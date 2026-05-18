import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../api/authApi'
import { useAuthStore } from '@/app/store/authStore'
import type { LoginRequest, RegisterRequest } from '@/shared/types/api.types'

export const useLogin = () => {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (res) => {
      setAuth(res.user, res.access_token, res.refresh_token)
      toast.success(`Welcome back, ${res.user.username}!`)
      navigate('/dashboard')
    },
    onError: () => {
      toast.error('Invalid email or password')
    },
  })
}

export const useRegister = () => {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (res) => {
      setAuth(res.user, res.access_token, res.refresh_token)
      toast.success(`Welcome to Life OS, ${res.user.username}!`)
      navigate('/dashboard')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Registration failed'
      toast.error(msg)
    },
  })
}
