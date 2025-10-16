/**
 * API Client Wrapper with Interceptors (T026)
 * 
 * Configured axios instance with:
 * - Request interceptor: Auto-inject Authorization Bearer token
 * - Response interceptor: Handle 401 (token refresh + retry)
 * - Response interceptor: Format 403/500 errors for user display
 * - Base URL configuration from environment
 */

import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/config/env'
import { getAccessToken, setAccessToken, clearAuth } from './storage'
import type { RefreshResponse, ApiError } from '@/types'

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable HttpOnly cookies for refresh tokens
})

// Track if a token refresh is in progress to avoid multiple simultaneous refresh attempts
let isRefreshing = false
let refreshPromise: Promise<string> | null = null

/**
 * Refresh the access token using the refresh endpoint
 * Returns the new access token or throws an error if refresh fails
 */
async function refreshAccessToken(): Promise<string> {
  try {
    const response = await axios.post<RefreshResponse>(
      `/auth/refresh`,
      {},
      { withCredentials: true } // Send HttpOnly refresh cookie
    )
    
    const newToken = response.data.access_token
    setAccessToken(newToken)
    return newToken
  } catch (error) {
    // Refresh failed - clear auth and force re-login
    clearAuth()
    throw error
  }
}

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
 * Response Interceptor: Handle errors and token refresh
 */
apiClient.interceptors.response.use(
  // Success response - pass through
  (response) => response,
  
  // Error response - handle 401 (refresh), 403, 500
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    
    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // If a refresh is already in progress, wait for it
      if (isRefreshing && refreshPromise) {
        try {
          const newToken = await refreshPromise
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return apiClient(originalRequest)
        } catch (refreshError) {
          return Promise.reject(refreshError)
        }
      }
      
      // Start a new token refresh
      isRefreshing = true
      refreshPromise = refreshAccessToken()
      
      try {
        const newToken = await refreshPromise
        
        // Update the original request with new token and retry
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        
        isRefreshing = false
        refreshPromise = null
        
        return apiClient(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        refreshPromise = null
        
        // Refresh failed - redirect to login will be handled by authProvider
        return Promise.reject(refreshError)
      }
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
