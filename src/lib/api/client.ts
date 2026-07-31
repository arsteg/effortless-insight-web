import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { ApiError, ApiResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

// Token management
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  // Also set cookie for middleware (server-side) auth checks
  document.cookie = `${ACCESS_TOKEN_KEY}=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

export function updateAccessToken(accessToken: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  // Also update cookie for middleware (server-side) auth checks
  document.cookie = `${ACCESS_TOKEN_KEY}=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  // Also clear the cookie
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0`
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor - add auth token and handle FormData
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // If the request body is FormData, remove Content-Type header
    // so axios can set it automatically with the correct boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors and token refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Check if this is an auth endpoint that shouldn't trigger token refresh
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                           originalRequest.url?.includes('/auth/register') ||
                           originalRequest.url?.includes('/auth/forgot-password') ||
                           originalRequest.url?.includes('/auth/reset-password') ||
                           originalRequest.url?.includes('/auth/verify-email') ||
                           originalRequest.url?.includes('/auth/otp') ||
                           originalRequest.url?.includes('/auth/2fa/login') ||
                           originalRequest.url?.includes('/auth/oauth/')

    // Handle 402 - subscription required, trial expired, or feature not available
    if (error.response?.status === 402) {
      const errorCode = error.response?.data?.code || error.response?.data?.error

      // Check if this is a feature access issue (not a subscription issue)
      // These should NOT redirect - let the caller handle the error
      if (errorCode === 'FEATURE_NOT_AVAILABLE') {
        // The error contains the feature info - just pass it through for UI to handle
        return Promise.reject(error)
      }

      // Check if we're already on subscription-related pages to avoid redirect loops
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
      const isOnExemptPage = currentPath.startsWith('/select-plan') ||
                             currentPath.startsWith('/checkout') ||
                             currentPath.startsWith('/subscription-required') ||
                             currentPath.startsWith('/settings/billing')

      // Also check if this is an organization/auth operation that shouldn't trigger redirect
      const isExemptEndpoint = originalRequest.url?.includes('/auth/switch-organization') ||
                               originalRequest.url?.includes('/organizations')

      // Don't redirect if already on exempt page or if the endpoint is exempt
      if (isOnExemptPage || isExemptEndpoint) {
        return Promise.reject(error)
      }

      const subscriptionStatus = error.response?.data?.subscriptionStatus

      // For "no subscription" cases, redirect to plan selection
      // For expired/cancelled cases, show subscription required page
      if (errorCode === 'SUBSCRIPTION_REQUIRED' || subscriptionStatus === 'none' || !subscriptionStatus) {
        window.location.href = '/select-plan'
      } else {
        // Expired, cancelled, or other subscription issues
        window.location.href = `/subscription-required?error=${errorCode}&status=${subscriptionStatus}`
      }
      return Promise.reject(error)
    }

    // Handle 401 - attempt token refresh (but not for auth endpoints)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          { refreshToken }
        )

        const { accessToken, refreshToken: newRefreshToken } = response.data.data
        setTokens(accessToken, newRefreshToken)
        processQueue(null, accessToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        // Only clear tokens and redirect on actual auth errors (401/403), not network errors
        const refreshStatus = (refreshError as AxiosError)?.response?.status
        if (refreshStatus === 401 || refreshStatus === 403) {
          clearTokens()
          window.location.href = '/login'
        }
        // For network errors, just reject - user can retry when connection is restored
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Transform error for consistent handling. Some endpoints (collaboration)
    // return { error: "..." } instead of the standard { message } envelope, and
    // ASP.NET model validation returns ProblemDetails ({ title, errors }).
    const apiError: ApiError = {
      success: false,
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      message:
        error.response?.data?.message ||
        (error.response?.data as { error?: string } | undefined)?.error ||
        (error.response?.data as { title?: string } | undefined)?.title ||
        error.message ||
        'An unexpected error occurred',
      errors: error.response?.data?.errors,
    }

    return Promise.reject(apiError)
  }
)

export { apiClient }
export default apiClient
