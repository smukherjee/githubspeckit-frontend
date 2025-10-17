/**
 * T042-T044: Integration Test - Token Expiration Handling
 * 
 * Note: Backend doesn't support token refresh - tokens are single-use
 * Users must re-login when token expires
 * This test verifies proper error handling for expired tokens
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { authProvider } from '@/providers/authProvider'
import { setAccessToken, setUser, getAccessToken, getUser } from '@/utils/storage'

describe('T042: Token Expiration Handling', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should detect 401 response and trigger authentication error', async () => {
    await expect(
      authProvider.checkError({ status: 401 })
    ).rejects.toThrow('Authentication required')
  })

  it('should handle 403 forbidden errors without logout', async () => {
    setAccessToken('test-token-12345')
    setUser({
      user_id: 'user-1',
      email: 'test@acme.com',
      tenant_id: 'tenant-acme',
      roles: ['standard'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    await expect(
      authProvider.checkError({ status: 403 })
    ).rejects.toThrow("You don't have permission")

    // User should still be logged in (no logout on 403)
    expect(getAccessToken()).toBeTruthy()
    expect(getUser()).toBeTruthy()
  })

  it('should allow re-login after token expiration', async () => {
    // Simulate expired token
    setAccessToken('expired-token')
    setUser({
      user_id: 'user-1',
      email: 'test@acme.com',
      tenant_id: 'tenant-acme',
      roles: ['standard'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Clear expired auth
    await authProvider.logout()

    // Re-login
    await authProvider.login({
      username: 'infysightsa@infysight.com',
      password: 'infysightsa123',
    })

    const user = getUser()
    expect(user).toBeTruthy()
    expect(user?.email).toBe('infysightsa@infysight.com')
  })
})
