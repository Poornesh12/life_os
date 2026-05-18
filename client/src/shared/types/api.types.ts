// ─── API Response wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  message: string
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  username: string
  is_active: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}
