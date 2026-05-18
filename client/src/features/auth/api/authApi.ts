import { apiClient } from '@/shared/services/apiClient'
import type { ApiSuccess, LoginRequest, RegisterRequest, TokenResponse, User } from '@/shared/types/api.types'

export const authApi = {
  register: async (data: RegisterRequest) => {
    const res = await apiClient.post<ApiSuccess<TokenResponse>>('/auth/register', data)
    return res.data.data
  },

  login: async (data: LoginRequest) => {
    const res = await apiClient.post<ApiSuccess<TokenResponse>>('/auth/login', data)
    return res.data.data
  },

  refresh: async (refresh_token: string) => {
    const res = await apiClient.post<ApiSuccess<TokenResponse>>('/auth/refresh', { refresh_token })
    return res.data.data
  },

  getMe: async () => {
    const res = await apiClient.get<ApiSuccess<User>>('/auth/me')
    return res.data.data
  },
}
