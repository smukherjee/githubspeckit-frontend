/**
 * Authentication Type Definitions (T023)
 * 
 * Hybrid JWT authentication with localStorage access token + HttpOnly refresh cookie.
 * Login: email/password → returns access_token (short-lived) + user object
 * Refresh: HttpOnly cookie → returns new access_token (transparent renewal)
 */

import type { User } from './user'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string // JWT access token (store in localStorage)
  token_type: 'Bearer' // Always "Bearer"
  expires_in: number // Token lifetime in seconds (e.g., 900 = 15 minutes)
  user: User // Current user object
}

export interface RefreshResponse {
  access_token: string // New JWT access token
  expires_in: number // Token lifetime in seconds
}
