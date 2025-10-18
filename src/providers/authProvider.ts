/**
 * Authentication Provider for React-Admin
 *
 * Implements the AuthProvider interface for JWT authentication with:
 * - Login: POST /api/v1/auth/login → store access token + user
 * - Logout: POST /api/v1/auth/logout → clear localStorage
 * - checkAuth: Fast token existence check (no API call)
 * - checkError: Handle 401 errors (token refresh handled by api.ts interceptor)
 * - getPermissions: Return user roles from localStorage
 * - getIdentity: Return user object in react-admin format
 */

import type { AuthProvider } from 'react-admin'
import { apiClient } from '@/utils/api'
import {
  getAccessToken,
  setAccessToken,
  getUser,
  setUser,
  clearAuth,
} from '@/utils/storage'
import type { LoginResponse } from '@/types/auth'
import { logSecurityEvent, setUserContext, clearUserContext } from '@/config/sentry'

/**
 * Refresh access token using HttpOnly refresh cookie
 * DEPRECATED: Backend doesn't support token refresh - JWT tokens are single-use
 * Kept for backward compatibility but will reject
 */
export async function refreshAccessToken(): Promise<string> {
  try {
    // Backend doesn't have a refresh endpoint - tokens are non-refreshable
    // User must re-login when token expires
    clearAuth()
    throw new Error('Token refresh not supported - please re-login')
  } catch (error) {
    clearAuth()
    throw error
  }
}

/**
 * React-Admin AuthProvider implementation
 */
export const authProvider: AuthProvider = {
  /**
   * Login with email and password
   * Stores access token and user object in localStorage
   */
  login: async ({ username, password }: { username: string; password: string }) => {
    try {
      const response = await apiClient.post<LoginResponse>(
        '/auth/login',
        {
          email: username,  // Map username to email for backend
          password,
        }
      )

      // Store access token and user object
      setAccessToken(response.data.access_token)
      setUser(response.data.user)
      
      // Set Sentry user context for error tracking
      setUserContext(
        response.data.user.user_id,
        response.data.user.email,
        response.data.user.tenant_id
      )

      return Promise.resolve()
    } catch (error) {
      console.error('Login failed:', error)
      
      // Log security event
      logSecurityEvent('auth_failed', {
        email: username,
        reason: error instanceof Error ? error.message : 'Unknown error',
      })
      
      return Promise.reject(
        new Error('Invalid email or password. Please try again.')
      )
    }
  },

    /**
   * Logout user and clear stored credentials
   * Calls backend revoke endpoint to invalidate token, then clears localStorage
   */
  logout: async () => {
    try {
      // Call backend revoke endpoint to invalidate the JWT token
      // This stores the JWT ID (jti) in the database to prevent replay attacks
      await apiClient.post('/auth/revoke')
    } catch (error) {
      // Silently handle revocation errors (token may already be invalid/expired)
      // Don't prevent logout - clearing local state is more important than revocation
      // Note: 422 errors are expected when token is already invalid
    } finally {
      // Always clear auth data from localStorage
      clearAuth()
      
      // Clear Sentry user context
      clearUserContext()
    }

    return Promise.resolve()
  },

  /**
   * Fast authentication check - validates token exists
   * No API call for performance (react-admin calls this frequently)
   */
  checkAuth: async () => {
    const token = getAccessToken()

    if (!token) {
      return Promise.reject(new Error('No authentication token found'))
    }

    // Optional: Could decode JWT and check expiration here
    // For now, rely on api.ts interceptor to handle expired tokens

    return Promise.resolve()
  },

  /**
   * Handle authentication errors (401, 403)
   * Called by react-admin when API returns error response
   */
  checkError: async (error: { status?: number }) => {
    const status = error.status
    const user = getUser()

    if (status === 401) {
      // Token expired or invalid
      // api.ts interceptor will attempt refresh automatically
      // If refresh fails, clearAuth() is called and user is redirected to login
      
      logSecurityEvent('token_expired', {
        userId: user?.user_id,
        tenantId: user?.tenant_id,
      })
      
      return Promise.reject(new Error('Authentication required'))
    }

    if (status === 403) {
      // Forbidden - user doesn't have permission
      // Don't logout, just show error message
      
      logSecurityEvent('permission_denied', {
        userId: user?.user_id,
        tenantId: user?.tenant_id,
        reason: 'HTTP 403 Forbidden',
      })
      
      return Promise.reject(
        new Error("You don't have permission to access this resource")
      )
    }

    // Other errors - don't trigger logout
    return Promise.resolve()
  },

  /**
   * Get user permissions (roles)
   * Used by react-admin to determine which resources/actions to show
   */
  getPermissions: async () => {
    const user = getUser()

    if (!user || !user.roles) {
      return Promise.reject(new Error('No user found'))
    }

    // Return roles array
    // React-admin will use this to filter resources and actions
    return Promise.resolve(user.roles)
  },

  /**
   * Get user identity for display in AppBar
   * Must return object with id, fullName, and optionally avatar
   */
  getIdentity: async () => {
    const user = getUser()

    if (!user) {
      return Promise.reject(new Error('No user found'))
    }

    // Transform User object to react-admin Identity format
    return Promise.resolve({
      id: user.user_id,
      fullName: user.email, // Use email as display name (no separate name field)
      avatar: undefined, // No avatar support yet
    })
  },
}
