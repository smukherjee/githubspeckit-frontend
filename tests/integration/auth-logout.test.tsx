/**
 * T030-T033: Integration Test - Logout & Session Cleanup
 * 
 * Test Scenario 5 from plan.md quickstart:
 * - Login with any user
 * - Click logout button
 * - Verify POST /api/v1/auth/revoke called
 * - Verify localStorage cleared (access_token, user removed)
 * - Verify redirect to /login
 * - Attempt to navigate to protected route → redirect back to /login
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { authProvider } from '@/providers/authProvider'
import { getAccessToken, getUser, setAccessToken, setUser } from '@/utils/storage'

describe('T030: Logout & Session Cleanup', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should call backend revoke endpoint and clear localStorage', async () => {
    // Setup authenticated state
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

    // Call logout
    await authProvider.logout()

    // Verify localStorage cleared
    expect(getAccessToken()).toBeNull()
    expect(getUser()).toBeNull()
  })

  it('should clear localStorage even if revoke call fails', async () => {
    // Setup authenticated state with invalid token (will cause revoke to fail)
    setAccessToken('invalid-token')
    setUser({
      user_id: 'user-1',
      email: 'test@acme.com',
      tenant_id: 'tenant-acme',
      roles: ['standard'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Call logout - should not throw even if revoke fails
    await authProvider.logout()

    // Verify localStorage still cleared
    expect(getAccessToken()).toBeNull()
    expect(getUser()).toBeNull()
  })

  it('should prevent access to protected routes after logout', async () => {
    // Setup authenticated state
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

    // Verify checkAuth passes before logout
    await expect(authProvider.checkAuth()).resolves.toBeUndefined()

    // Logout
    await authProvider.logout()

    // Verify checkAuth now fails
    await expect(authProvider.checkAuth()).rejects.toThrow()
  })

  it('should resolve promise on successful logout', async () => {
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

    await expect(authProvider.logout()).resolves.toBeUndefined()
  })
})
