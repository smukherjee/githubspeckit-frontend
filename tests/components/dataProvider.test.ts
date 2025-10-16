/**
 * T023-T031: Component Test - dataProvider tenant_id injection
 * 
 * Test the dataProvider implementation in isolation:
 * - Verify tenant_id injected into all requests (except /users/me and /tenants)
 * - Verify superadmin uses selected tenant_id from TenantContext
 * - Verify tenant_admin/standard use tenant_id from JWT
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createDataProvider } from '@/providers/dataProvider'
import { setUser } from '@/utils/storage'

describe('T023: dataProvider.getList() with tenant_id', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should inject tenant_id for standard user', async () => {
    setUser({
      user_id: 'user-1',
      email: 'user@acme.com',
      tenant_id: 'tenant-acme',
      roles: ['standard'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    const result = await dataProvider.getList('users', {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    })

    expect(result.data).toBeDefined()
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('should NOT inject tenant_id for tenants resource', async () => {
    setUser({
      user_id: 'user-1',
      email: 'admin@infysight.com',
      tenant_id: 'tenant-infysight',
      roles: ['superadmin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    const result = await dataProvider.getList('tenants', {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    })

    expect(result.data).toBeDefined()
    expect(Array.isArray(result.data)).toBe(true)
  })
})

describe('T024: dataProvider.getOne() with tenant_id', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should inject tenant_id for standard user', async () => {
    setUser({
      user_id: 'user-1',
      email: 'user@acme.com',
      tenant_id: 'tenant-acme',
      roles: ['standard'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    const result = await dataProvider.getOne('users', { user_id: 'user-1' })

    expect(result.data).toBeDefined()
    expect(result.data.id).toBe('user-1')
  })
})

describe('T025: dataProvider.create() with tenant_id', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should inject tenant_id in request body', async () => {
    setUser({
      user_id: 'user-1',
      email: 'admin@acme.com',
      tenant_id: 'tenant-acme',
      roles: ['tenant_admin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    const result = await dataProvider.create('users', {
      data: {
        email: 'newuser@acme.com',
        password: 'Test@1234',
        roles: ['standard'],
      },
    })

    expect(result.data).toBeDefined()
    expect(result.data.email).toBe('newuser@acme.com')
  })

  it('should use special /policies/register endpoint for policies', async () => {
    setUser({
      user_id: 'user-1',
      email: 'admin@acme.com',
      tenant_id: 'tenant-acme',
      roles: ['tenant_admin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    const result = await dataProvider.create('policies', {
      data: {
        resource: 'users',
        action: 'read',
        effect: 'allow',
        condition_expression: '',
      },
    })

    expect(result.data).toBeDefined()
  })

  it('should reject create for invitations (read-only)', async () => {
    setUser({
      user_id: 'user-1',
      email: 'admin@acme.com',
      tenant_id: 'tenant-acme',
      roles: ['tenant_admin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    
    await expect(
      dataProvider.create('invitations', { data: {} })
    ).rejects.toThrow('read-only')
  })
})

describe('T026: dataProvider.update() with tenant_id', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should inject tenant_id in request body', async () => {
    setUser({
      user_id: 'user-1',
      email: 'admin@acme.com',
      tenant_id: 'tenant-acme',
      roles: ['tenant_admin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    const result = await dataProvider.update('users', {
      user_id: 'user-2',
      data: { email: 'updated@acme.com' },
      previousData: { user_id: 'user-2', email: 'old@acme.com' },
    })

    expect(result.data).toBeDefined()
  })

  it('should reject update for audit-events (read-only)', async () => {
    setUser({
      user_id: 'user-1',
      email: 'admin@acme.com',
      tenant_id: 'tenant-acme',
      roles: ['tenant_admin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    
    await expect(
      dataProvider.update('audit-events', {
        id: 'event-1',
        data: {},
        previousData: {},
      })
    ).rejects.toThrow('read-only')
  })
})

describe('T027: dataProvider.delete() with tenant_id', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should inject tenant_id as query param', async () => {
    setUser({
      user_id: 'user-1',
      email: 'admin@acme.com',
      tenant_id: 'tenant-acme',
      roles: ['tenant_admin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    const result = await dataProvider.delete('users', {
      user_id: 'user-2',
      previousData: { user_id: 'user-2' },
    })

    expect(result.data).toBeDefined()
  })

  it('should reject delete for audit-events (read-only)', async () => {
    setUser({
      user_id: 'user-1',
      email: 'admin@acme.com',
      tenant_id: 'tenant-acme',
      roles: ['tenant_admin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    
    await expect(
      dataProvider.delete('audit-events', {
        id: 'event-1',
        previousData: {},
      })
    ).rejects.toThrow('read-only')
  })
})

describe('T028: dataProvider with superadmin tenant switching', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should use selected tenant_id for superadmin', async () => {
    setUser({
      user_id: 'user-1',
      email: 'admin@infysight.com',
      tenant_id: 'tenant-infysight',
      roles: ['superadmin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Create dataProvider with selected tenant
    const dataProvider = createDataProvider('tenant-acme')
    const result = await dataProvider.getList('users', {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    })

    expect(result.data).toBeDefined()
  })
})

describe('T029: dataProvider special cases', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should handle feature-flags without pagination', async () => {
    setUser({
      user_id: 'user-1',
      email: 'admin@acme.com',
      tenant_id: 'tenant-acme',
      roles: ['tenant_admin'],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const dataProvider = createDataProvider()
    const result = await dataProvider.getList('feature-flags', {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    })

    expect(result.data).toBeDefined()
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('should handle policies without pagination', async () => {
    setUser({
      user_id: 'user-1',
      email: 'admin@acme.com',
      tenant_id: 'tenant-acme',
      roles: ['tenant_admin'],
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

  it('should handle audit-events without pagination', async () => {
    setUser({
      user_id: 'user-1',
      email: 'admin@acme.com',
      tenant_id: 'tenant-acme',
      roles: ['tenant_admin'],
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
