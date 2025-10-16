/**
 * User Type Definitions (T021)
 * 
 * Core user entity with role-based access control.
 * Roles: superadmin (cross-tenant), tenant_admin (tenant-scoped), standard (read-only)
 * Status: invited (pending), active (verified), disabled (soft-deleted)
 */

export type UserRole = 'superadmin' | 'tenant_admin' | 'standard'

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
