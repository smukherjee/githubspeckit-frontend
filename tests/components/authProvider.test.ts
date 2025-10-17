/**
 * T017-T019: Component Tests - authProvider
 * 
 * Test the authProvider implementation in isolation:
 * - T017: login() method
 * - T018: checkAuth() method
 * - T019: checkError() 401 handling
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { authProvider } from '@/providers/authProvider'
import { getAccessToken, getUser, setAccessToken, setUser } from '@/utils/storage'

describe('T017: authProvider.login()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should store access_token in localStorage on success', async () => {
    await authProvider.login({ 
      username: 'infysightsa@infysight.com', 
      password: 'infysightsa123' 
    })
    
    const token = getAccessToken()
    expect(token).toBeTruthy()
    expect(typeof token).toBe('string')
  })

  it('should store user object in localStorage on success', async () => {
    await authProvider.login({ 
      username: 'infysightsa@infysight.com', 
      password: 'infysightsa123' 
    })
    
    const user = getUser()
    expect(user).toBeTruthy()
    expect(user?.email).toBe('infysightsa@infysight.com')
    expect(user?.roles).toContain('superadmin')
  })

  it('should reject promise with error on invalid credentials', async () => {
    await expect(
      authProvider.login({ 
        username: 'invalid@example.com', 
        password: 'wrongpassword' 
      })
    ).rejects.toThrow()
  })
})

describe('T018: authProvider.checkAuth()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should resolve promise if access_token exists in localStorage', async () => {
    setAccessToken('test-token-12345')
    setUser({
      user_id: 'user-1',
      email: 'test@example.com',
      tenant_id: 'tenant-1',
      roles: ['standard'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    
    await expect(authProvider.checkAuth()).resolves.toBeUndefined()
  })

  it('should reject promise if access_token missing from localStorage', async () => {
    await expect(authProvider.checkAuth()).rejects.toThrow()
  })
})

describe('T019: authProvider.checkError()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should reject promise on 401 error', async () => {
    await expect(
      authProvider.checkError({ status: 401 })
    ).rejects.toThrow('Authentication required')
  })

  it('should reject promise on 403 error', async () => {
    await expect(
      authProvider.checkError({ status: 403 })
    ).rejects.toThrow("You don't have permission")
  })

  it('should resolve promise for non-401/403 errors', async () => {
    await expect(authProvider.checkError({ status: 500 })).resolves.toBeUndefined()
    await expect(authProvider.checkError({ status: 404 })).resolves.toBeUndefined()
  })
})

describe('T020: authProvider.logout()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should clear localStorage on logout', async () => {
    setAccessToken('test-token-12345')
    setUser({
      user_user_id: 'user-1',
      email: 'test@example.com',
      tenant_id: 'tenant-1',
      roles: ['standard'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    
    await authProvider.logout()
    
    expect(getAccessToken()).toBeNull()
    expect(getUser()).toBeNull()
  })
})

describe('T021: authProvider.getPermissions()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return user roles from localStorage', async () => {
    setUser({
      user_user_id: 'user-1',
      email: 'test@example.com',
      tenant_id: 'tenant-1',
      roles: ['superadmin', 'tenant_admin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    
    const permissions = await authProvider.getPermissions()
    expect(permissions).toEqual(['superadmin', 'tenant_admin'])
  })

  it('should reject if no user in localStorage', async () => {
    await expect(authProvider.getPermissions()).rejects.toThrow()
  })
})

describe('T022: authProvider.getIdentity()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return user identity in react-admin format', async () => {
    setUser({
      user_id: 'user-1',
      email: 'test@example.com',
      tenant_id: 'tenant-1',
      roles: ['standard'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    
    const identity = await authProvider.getIdentity()
    expect(identity).toMatchObject({
      id: 'user-1',
      fullName: 'test@example.com',
    })
  })

  it('should reject if no user in localStorage', async () => {
    await expect(authProvider.getIdentity()).rejects.toThrow()
  })
})
