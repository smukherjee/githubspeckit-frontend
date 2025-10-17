/**
 * User Type Definitions (T021)
 * 
 * Core user entity with role-based access control.
 * Roles: superadmin (cross-tenant), support_readonly, tenant_admin (tenant-scoped), user (standard access)
 * Status: invited (pending), active (verified), disabled (soft-deleted)
 */

export type UserRole = 'superadmin' | 'support_readonly' | 'tenant_admin' | 'user'

export type UserStatus = 'invited' | 'active' | 'disabled'

export interface User {
  user_id: string
  tenant_id: string
  email: string
  roles: UserRole[]
  status: UserStatus
  created_at: string // ISO 8601 datetime
  updated_at: string // ISO 8601 datetime
}
