/**
 * Test Utilities - User Factory
 * 
 * Helper functions to create properly typed User objects for tests
 */

import type { User, UserRole, UserStatus } from '@/types'

export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    user_user_id: 'user-test-1',
    tenant_id: 'tenant-test',
    email: 'test@example.com',
    roles: ['standard'] as UserRole[],
    status: 'active' as UserStatus,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export const TEST_USERS = {
  superadmin: createTestUser({
    user_user_id: 'user-superadmin',
    email: 'infysightsa@infysight.com',
    tenant_id: 'tenant-infysight',
    roles: ['superadmin'],
  }),
  tenantAdmin: createTestUser({
    user_user_id: 'user-admin',
    email: 'infysightadmin@infysight.com',
    tenant_id: 'tenant-infysight',
    roles: ['tenant_admin'],
  }),
  standard: createTestUser({
    user_user_id: 'user-standard',
    email: 'infysightuser@infysight.com',
    tenant_id: 'tenant-infysight',
    roles: ['standard'],
  }),
}
