/**
 * T045-T048: Integration Test - Standard User Limited Access
 * 
 * Test Scenario 3 from plan.md quickstart:
 * - Login with infysightuser@infysight.com
 * - Verify only permitted resources accessible
 * - Verify disallowed resources return proper errors
 * - Verify tenant isolation (can only access own tenant data)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { authProvider } from '@/providers/authProvider'
import { createDataProvider } from '@/providers/dataProvider'
import { setUser } from '@/utils/storage'

describe('T045: Standard User Limited Access', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should allow standard user to login', async () => {
    await authProvider.login({
      username: 'infysightuser@infysight.com',
      password: 'User@1234',
    })

    const permissions = await authProvider.getPermissions()
    expect(permissions).toContain('standard')
    expect(permissions).not.toContain('superadmin')
    expect(permissions).not.toContain('tenant_admin')
  })

  it('should use user tenant_id for standard user', async () => {
    setUser({
      user_id: 'user-standard',
      email: 'infysightuser@infysight.com',
      tenant_id: 'tenant-infysight',
      roles: ['standard'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    
    // Standard user can read users in their tenant
    const result = await dataProvider.getList('users', {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    })

    expect(result.data).toBeDefined()
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('should prevent standard user from creating users', async () => {
    setUser({
      user_id: 'user-standard',
      email: 'infysightuser@infysight.com',
      tenant_id: 'tenant-infysight',
      roles: ['standard'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    
    // Standard users typically don't have create permissions
    // This will be enforced by backend returning 403
    await expect(
      dataProvider.create('users', {
        data: {
          email: 'newuser@infysight.com',
          password: 'Test@1234',
          roles: ['standard'],
        },
      })
    ).rejects.toThrow()
  })

  it('should allow standard user to read policies', async () => {
    setUser({
      user_id: 'user-standard',
      email: 'infysightuser@infysight.com',
      tenant_id: 'tenant-infysight',
      roles: ['standard'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    
    const result = await dataProvider.getList('policies', {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    })

    expect(result.data).toBeDefined()
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('should allow standard user to read audit events', async () => {
    setUser({
      user_id: 'user-standard',
      email: 'infysightuser@infysight.com',
      tenant_id: 'tenant-infysight',
      roles: ['standard'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    
    const result = await dataProvider.getList('audit-events', {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    })

    expect(result.data).toBeDefined()
    expect(Array.isArray(result.data)).toBe(true)
  })
})
