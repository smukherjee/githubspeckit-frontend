/**
 * localStorage Abstraction (T027)
 * 
 * Type-safe wrappers around localStorage for authentication data.
 * Provides JSON parsing/serialization and consistent key naming.
 */

import type { User } from '@/types'

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER: 'user',
} as const

/**
 * Get the access token from localStorage
 * @returns The access token or null if not found
 */
export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  } catch (error) {
    console.error('Failed to get access token from localStorage:', error)
    return null
  }
}

/**
 * Set the access token in localStorage
 * @param token - The JWT access token to store
 */
export function setAccessToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
  } catch (error) {
    console.error('Failed to set access token in localStorage:', error)
  }
}

/**
 * Get the user object from localStorage
 * @returns The user object or null if not found
 */
export function getUser(): User | null {
  try {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER)
    if (!userJson) return null
    
    return JSON.parse(userJson) as User
  } catch (error) {
    console.error('Failed to get user from localStorage:', error)
    return null
  }
}

/**
 * Set the user object in localStorage
 * @param user - The user object to store
 */
export function setUser(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  } catch (error) {
    console.error('Failed to set user in localStorage:', error)
  }
}

/**
 * Clear authentication data from localStorage
 * Removes both access token and user object
 */
export function clearAuth(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
  } catch (error) {
    console.error('Failed to clear auth from localStorage:', error)
  }
}

/**
 * Clear only the user object from localStorage
 * Useful when user data needs to be refreshed without logging out
 */
export function clearUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER)
  } catch (error) {
    console.error('Failed to clear user from localStorage:', error)
  }
}
