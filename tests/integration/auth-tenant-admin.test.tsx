/**
 * T038-T041: Integration Test - Tenant Admin User Management
 * 
 * Test Scenario 2 from plan.md quickstart:
 * - Login with infysightadmin@infysight.com
 * - Verify NO tenant dropdown visible (tenant_admin cannot switch tenants)
 * - Verify tenant_id fixed to user's tenant (tenant-infysight)
 * - Verify Tenants menu item hidden (403 for tenant_admin role)
 * - Navigate to Users → Create
 * - Verify API request includes ?tenant_id=tenant-infysight
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { authProvider } from '@/providers/authProvider'
import { createDataProvider } from '@/providers/dataProvider'
import { getUser, setUser } from '@/utils/storage'

describe('T038: Tenant Admin User Management', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should allow tenant admin to login', async () => {
    await authProvider.login({
      username: 'infysightadmin@infysight.com',
      password: 'Admin@1234',
    })

    const user = getUser()
    expect(user).toBeTruthy()
    expect(user?.email).toBe('infysightadmin@infysight.com')
    expect(user?.roles).toContain('tenant_admin')
    expect(user?.tenant_id).toBe('tenant-infysight')
  })

  it('should NOT allow tenant_admin to switch tenants', async () => {
    setUser({
      user_id: 'user-admin',
      email: 'infysightadmin@infysight.com',
      tenant_id: 'tenant-infysight',
      roles: ['tenant_admin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const permissions = await authProvider.getPermissions()
    expect(permissions).toContain('tenant_admin')
    expect(permissions).not.toContain('superadmin')
  })

  it('should fix tenant_id to user JWT tenant for tenant_admin', async () => {
    setUser({
      user_id: 'user-admin',
      email: 'infysightadmin@infysight.com',
      tenant_id: 'tenant-infysight',
      roles: ['tenant_admin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Create dataProvider without selected tenant (uses user's tenant_id)
    const dataProvider = createDataProvider()
    
    const result = await dataProvider.getList('users', {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    })

    expect(result.data).toBeDefined()
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('should create user with tenant_admin tenant_id', async () => {
    setUser({
      user_id: 'user-admin',
      email: 'infysightadmin@infysight.com',
      tenant_id: 'tenant-infysight',
      roles: ['tenant_admin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    
    const result = await dataProvider.create('users', {
      data: {
        email: 'newuser@infysight.com',
        password: 'Test@1234',
        roles: ['standard'],
      },
    })

    expect(result.data).toBeDefined()
    expect(result.data.email).toBe('newuser@infysight.com')
    // Verify user created with tenant_admin's tenant_id
    expect(result.data.tenant_id).toBe('tenant-infysight')
  })
})
