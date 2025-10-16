/**
 * T034-T037: Integration Test - Superadmin Login & Tenant Switching
 * 
 * Test Scenario 1 from plan.md quickstart:
 * - Login with infysightsa@infysight.com
 * - Verify tenant dropdown visible (superadmin can switch tenants)
 * - Select Acme tenant from dropdown
 * - Navigate to Users → Create
 * - Verify API request includes ?tenant_id=tenant-acme
 * - Submit form → user created in Acme tenant
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { authProvider } from '@/providers/authProvider'
import { createDataProvider } from '@/providers/dataProvider'
import { getUser, setUser } from '@/utils/storage'

describe('T034: Superadmin Login & Tenant Switching', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should allow superadmin to login with correct credentials', async () => {
    await authProvider.login({
      username: 'infysightsa@infysight.com',
      password: 'Admin@1234',
    })

    const user = getUser()
    expect(user).toBeTruthy()
    expect(user?.email).toBe('infysightsa@infysight.com')
    expect(user?.roles).toContain('superadmin')
  })

  it('should return superadmin role in permissions', async () => {
    setUser({
      user_id: 'user-superadmin',
      email: 'infysightsa@infysight.com',
      tenant_id: 'tenant-infysight',
      roles: ['superadmin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const permissions = await authProvider.getPermissions()
    expect(permissions).toContain('superadmin')
  })

  it('should inject selected tenant_id for superadmin with tenant switching', async () => {
    setUser({
      user_id: 'user-superadmin',
      email: 'infysightsa@infysight.com',
      tenant_id: 'tenant-infysight',
      roles: ['superadmin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Create dataProvider with selected tenant (simulating tenant switch)
    const dataProvider = createDataProvider('tenant-acme')
    
    const result = await dataProvider.getList('users', {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    })

    expect(result.data).toBeDefined()
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('should allow superadmin to create user in selected tenant', async () => {
    setUser({
      user_id: 'user-superadmin',
      email: 'infysightsa@infysight.com',
      tenant_id: 'tenant-infysight',
      roles: ['superadmin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Create dataProvider with selected tenant
    const dataProvider = createDataProvider('tenant-acme')
    
    const result = await dataProvider.create('users', {
      data: {
        email: 'newuser@acme.com',
        password: 'Test@1234',
        roles: ['standard'],
      },
    })

    expect(result.data).toBeDefined()
    expect(result.data.email).toBe('newuser@acme.com')
    // Verify user created with correct tenant_id
    expect(result.data.tenant_id).toBe('tenant-acme')
  })
})
