/**
 * Record-Level Authorization Utilities
 * 
 * Implements the backend authorization matrix for user and profile management:
 * 
 * Authorization Matrix:
 * ┌──────────────────────────────────────┬──────────────┬──────────────┬────────────┐
 * │ Action                               │ Regular User │ Tenant Admin │ Superadmin │
 * ├──────────────────────────────────────┼──────────────┼──────────────┼────────────┤
 * │ View own profile                     │      ✅      │      ✅      │     ✅     │
 * │ View other users (same tenant)       │      ❌      │      ✅      │     ✅     │
 * │ View other users (different tenant)  │      ❌      │      ❌      │     ✅     │
 * │ Edit own profile                     │      ✅      │      ✅      │     ✅     │
 * │ Edit other users (same tenant)       │      ❌      │      ✅      │     ✅     │
 * │ Edit other users (different tenant)  │      ❌      │      ❌      │     ✅     │
 * └──────────────────────────────────────┴──────────────┴──────────────┴────────────┘
 */

import type { User, UserRole } from '@/types'
import { getUser } from './storage'

/**
 * Check if the current user has a specific role
 */
export function hasRole(user: User | null, role: UserRole | string): boolean {
  if (!user || !user.roles) return false
  return user.roles.includes(role as UserRole)
}

/**
 * Check if the current user is a superadmin
 */
export function isSuperadmin(user: User | null): boolean {
  return hasRole(user, 'superadmin')
}

/**
 * Check if the current user is a tenant admin
 */
export function isTenantAdmin(user: User | null): boolean {
  return hasRole(user, 'tenant_admin')
}

/**
 * Check if two users belong to the same tenant
 */
export function isSameTenant(currentUser: User | null, targetUser: { tenant_id?: string }): boolean {
  if (!currentUser || !targetUser) return false
  return currentUser.tenant_id === targetUser.tenant_id
}

/**
 * Check if the target user is the current user (viewing own profile)
 */
export function isSelfUser(currentUser: User | null, targetUserId: string): boolean {
  if (!currentUser) return false
  return currentUser.user_id === targetUserId
}

/**
 * Check if current user can VIEW a specific user record
 * 
 * Rules:
 * - Superadmin: Can view any user (any tenant)
 * - Tenant Admin: Can view users in same tenant only
 * - Regular User: Can only view their own user record
 */
export function canViewUser(targetUser: { user_id?: string; tenant_id?: string }): boolean {
  const currentUser = getUser()
  if (!currentUser || !targetUser.user_id) return false

  // Superadmin can view anyone
  if (isSuperadmin(currentUser)) return true

  // Check if viewing own record
  if (isSelfUser(currentUser, targetUser.user_id)) return true

  // Tenant admin can view users in same tenant
  if (isTenantAdmin(currentUser) && isSameTenant(currentUser, targetUser)) {
    return true
  }

  // Regular users can only view themselves (already checked above)
  return false
}

/**
 * Check if current user can EDIT a specific user record
 * 
 * Rules:
 * - Superadmin: Can edit any user (any tenant)
 * - Tenant Admin: Can edit users in same tenant only
 * - Regular User: Can only edit their own user record
 */
export function canEditUser(targetUser: { user_id?: string; tenant_id?: string }): boolean {
  const currentUser = getUser()
  if (!currentUser || !targetUser.user_id) return false

  // Superadmin can edit anyone
  if (isSuperadmin(currentUser)) return true

  // Check if editing own record
  if (isSelfUser(currentUser, targetUser.user_id)) return true

  // Tenant admin can edit users in same tenant
  if (isTenantAdmin(currentUser) && isSameTenant(currentUser, targetUser)) {
    return true
  }

  // Regular users can only edit themselves (already checked above)
  return false
}

/**
 * Check if current user can VIEW a specific user's profile
 * Same rules as canViewUser
 */
export function canViewProfile(targetUserId: string, targetTenantId?: string): boolean {
  return canViewUser({ user_id: targetUserId, tenant_id: targetTenantId })
}

/**
 * Check if current user can EDIT a specific user's profile
 * Same rules as canEditUser
 */
export function canEditProfile(targetUserId: string, targetTenantId?: string): boolean {
  return canEditUser({ user_id: targetUserId, tenant_id: targetTenantId })
}

/**
 * Check if current user can DELETE a user
 * Same rules as canEditUser (if you can edit, you can delete)
 */
export function canDeleteUser(targetUser: { user_id?: string; tenant_id?: string }): boolean {
  return canEditUser(targetUser)
}

/**
 * Check if current user can RESTORE a disabled user
 * Same rules as canEditUser
 */
export function canRestoreUser(targetUser: { user_id?: string; tenant_id?: string }): boolean {
  return canEditUser(targetUser)
}

/**
 * Check if current user can RESET PASSWORD for a user
 * Same rules as canEditUser
 */
export function canResetPassword(targetUser: { user_id?: string; tenant_id?: string }): boolean {
  return canEditUser(targetUser)
}

/**
 * Get a user-friendly error message for unauthorized access
 */
export function getUnauthorizedMessage(action: 'view' | 'edit'): string {
  const currentUser = getUser()
  
  if (!currentUser) {
    return 'You must be logged in to perform this action.'
  }

  if (isSuperadmin(currentUser)) {
    return 'Access denied.' // Shouldn't happen for superadmin
  }

  if (isTenantAdmin(currentUser)) {
    return `You can only ${action} users within your own tenant.`
  }

  return `You can only ${action} your own profile.`
}
