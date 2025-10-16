/**
 * API Client Wrapper with Interceptors (T026)
 * 
 * Configured axios instance with:
 * - Request interceptor: Auto-inject Authorization Bearer token
 * - Response interceptor: Handle 401 (no token refresh - backend uses non-refreshable tokens)
 * - Response interceptor: Format 403/500 errors for user display
 * - Base URL configuration from environment
 */

import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/config/env'
import { getAccessToken, clearAuth } from './storage'
import type { ApiError } from '@/types'

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request Interceptor: Inject Authorization Bearer token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response Interceptor: Handle errors
 * NOTE: Backend doesn't support token refresh - tokens are non-refreshable
 * On 401, user must re-login
 */
apiClient.interceptors.response.use(
  // Success response - pass through
  (response) => response,
  
  // Error response - handle 401, 403, 500
  async (error: AxiosError<ApiError>) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Backend doesn't support token refresh - tokens are single-use/non-refreshable
      // User must re-login to get a new token
      clearAuth()
      
      const apiError: ApiError = {
        detail: error.response.data?.detail || 'Your session has expired. Please login again.',
        status: 401,
      }
      return Promise.reject(apiError)
    }
    
    // Handle 403 Forbidden - format user-friendly message
    if (error.response?.status === 403) {
      const apiError: ApiError = {
        detail: error.response.data?.detail || 'You do not have permission to access this resource.',
        status: 403,
      }
      return Promise.reject(apiError)
    }
    
    // Handle 500 Internal Server Error - format user-friendly message
    if (error.response?.status === 500) {
      const apiError: ApiError = {
        detail: error.response.data?.detail || 'An unexpected error occurred. Please try again later.',
        status: 500,
      }
      return Promise.reject(apiError)
    }
    
    // Handle other errors - pass through with detail if available
    if (error.response?.data?.detail) {
      const apiError: ApiError = {
        detail: error.response.data.detail,
        status: error.response.status || 500,
      }
      return Promise.reject(apiError)
    }
    
    // Network error or other non-response error
    return Promise.reject(error)
  }
)

export default apiClient

