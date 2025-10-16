/**
 * Permission Helper Functions (T028)
 * 
 * RBAC permission configuration and utility functions for screen-level authorization.
 * Maps user roles to resource permissions for react-admin resource configuration.
 */

import type { UserRole, PermissionLevel, RolePermissions } from '@/types'

/**
 * ROLE_PERMISSIONS: Complete mapping of roles to resource permissions
 * 
 * Permission levels:
 * - 'allowed': Full access (list, show, create, edit, delete)
 * - 'readonly': Read access only (list, show)
 * - 'disallowed': No access (hide from menu, redirect to 403)
 */
export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'superadmin',
    permissions: [
      // Superadmin: Full access to all resources
      { resource: 'users', action: 'list', permission: 'allowed' },
      { resource: 'users', action: 'show', permission: 'allowed' },
      { resource: 'users', action: 'create', permission: 'allowed' },
      { resource: 'users', action: 'edit', permission: 'allowed' },
      { resource: 'users', action: 'delete', permission: 'allowed' },
      
      { resource: 'tenants', action: 'list', permission: 'allowed' },
      { resource: 'tenants', action: 'show', permission: 'allowed' },
      { resource: 'tenants', action: 'create', permission: 'allowed' },
      { resource: 'tenants', action: 'edit', permission: 'allowed' },
      { resource: 'tenants', action: 'delete', permission: 'allowed' },
      
      { resource: 'feature-flags', action: 'list', permission: 'allowed' },
      { resource: 'feature-flags', action: 'show', permission: 'allowed' },
      { resource: 'feature-flags', action: 'create', permission: 'allowed' },
      { resource: 'feature-flags', action: 'edit', permission: 'allowed' },
      { resource: 'feature-flags', action: 'delete', permission: 'allowed' },
      
      { resource: 'policies', action: 'list', permission: 'allowed' },
      { resource: 'policies', action: 'show', permission: 'allowed' },
      { resource: 'policies', action: 'create', permission: 'allowed' },
      { resource: 'policies', action: 'edit', permission: 'allowed' },
      { resource: 'policies', action: 'delete', permission: 'allowed' },
      
      { resource: 'invitations', action: 'list', permission: 'allowed' },
      { resource: 'invitations', action: 'show', permission: 'allowed' },
      { resource: 'invitations', action: 'create', permission: 'allowed' },
      { resource: 'invitations', action: 'revoke', permission: 'allowed' },
      
      { resource: 'audit-events', action: 'list', permission: 'allowed' },
      { resource: 'audit-events', action: 'show', permission: 'allowed' },
    ],
  },
  {
    role: 'tenant_admin',
    permissions: [
      // Tenant Admin: Full access to tenant-scoped resources, no tenant management
      { resource: 'users', action: 'list', permission: 'allowed' },
      { resource: 'users', action: 'show', permission: 'allowed' },
      { resource: 'users', action: 'create', permission: 'allowed' },
      { resource: 'users', action: 'edit', permission: 'allowed' },
      { resource: 'users', action: 'delete', permission: 'allowed' },
      
      { resource: 'tenants', action: 'list', permission: 'disallowed' },
      { resource: 'tenants', action: 'show', permission: 'disallowed' },
      { resource: 'tenants', action: 'create', permission: 'disallowed' },
      { resource: 'tenants', action: 'edit', permission: 'disallowed' },
      { resource: 'tenants', action: 'delete', permission: 'disallowed' },
      
      { resource: 'feature-flags', action: 'list', permission: 'allowed' },
      { resource: 'feature-flags', action: 'show', permission: 'allowed' },
      { resource: 'feature-flags', action: 'create', permission: 'allowed' },
      { resource: 'feature-flags', action: 'edit', permission: 'allowed' },
      { resource: 'feature-flags', action: 'delete', permission: 'allowed' },
      
      { resource: 'policies', action: 'list', permission: 'allowed' },
      { resource: 'policies', action: 'show', permission: 'allowed' },
      { resource: 'policies', action: 'create', permission: 'allowed' },
      { resource: 'policies', action: 'edit', permission: 'allowed' },
      { resource: 'policies', action: 'delete', permission: 'allowed' },
      
      { resource: 'invitations', action: 'list', permission: 'allowed' },
      { resource: 'invitations', action: 'show', permission: 'allowed' },
      { resource: 'invitations', action: 'create', permission: 'allowed' },
      { resource: 'invitations', action: 'revoke', permission: 'allowed' },
      
      { resource: 'audit-events', action: 'list', permission: 'allowed' },
      { resource: 'audit-events', action: 'show', permission: 'allowed' },
    ],
  },
  {
    role: 'standard',
    permissions: [
      // Standard User: Read-only access to limited resources
      { resource: 'users', action: 'list', permission: 'readonly' },
      { resource: 'users', action: 'show', permission: 'readonly' },
      { resource: 'users', action: 'create', permission: 'disallowed' },
      { resource: 'users', action: 'edit', permission: 'disallowed' },
      { resource: 'users', action: 'delete', permission: 'disallowed' },
      
      { resource: 'tenants', action: 'list', permission: 'disallowed' },
      { resource: 'tenants', action: 'show', permission: 'disallowed' },
      { resource: 'tenants', action: 'create', permission: 'disallowed' },
      { resource: 'tenants', action: 'edit', permission: 'disallowed' },
      { resource: 'tenants', action: 'delete', permission: 'disallowed' },
      
      { resource: 'feature-flags', action: 'list', permission: 'disallowed' },
      { resource: 'feature-flags', action: 'show', permission: 'disallowed' },
      { resource: 'feature-flags', action: 'create', permission: 'disallowed' },
      { resource: 'feature-flags', action: 'edit', permission: 'disallowed' },
      { resource: 'feature-flags', action: 'delete', permission: 'disallowed' },
      
      { resource: 'policies', action: 'list', permission: 'readonly' },
      { resource: 'policies', action: 'show', permission: 'readonly' },
      { resource: 'policies', action: 'create', permission: 'disallowed' },
      { resource: 'policies', action: 'edit', permission: 'disallowed' },
      { resource: 'policies', action: 'delete', permission: 'disallowed' },
      
      { resource: 'invitations', action: 'list', permission: 'disallowed' },
      { resource: 'invitations', action: 'show', permission: 'disallowed' },
      { resource: 'invitations', action: 'create', permission: 'disallowed' },
      { resource: 'invitations', action: 'revoke', permission: 'disallowed' },
      
      { resource: 'audit-events', action: 'list', permission: 'readonly' },
      { resource: 'audit-events', action: 'show', permission: 'readonly' },
    ],
  },
]

/**
 * Get the permission level for a specific role, resource, and action
 * 
 * @param role - User role (superadmin, tenant_admin, standard)
 * @param resource - Resource name (users, tenants, feature-flags, etc.)
 * @param action - Action name (list, show, create, edit, delete)
 * @returns The permission level or 'disallowed' if not found
 */
export function getPermissionForResource(
  role: UserRole,
  resource: string,
  action: string
): PermissionLevel {
  const roleConfig = ROLE_PERMISSIONS.find((rp) => rp.role === role)
  
  if (!roleConfig) {
    console.warn(`No permission configuration found for role: ${role}`)
    return 'disallowed'
  }
  
  const permission = roleConfig.permissions.find(
    (p) => p.resource === resource && p.action === action
  )
  
  if (!permission) {
    console.warn(`No permission found for role=${role}, resource=${resource}, action=${action}`)
    return 'disallowed'
  }
  
  return permission.permission
}

/**
 * Check if a role can access a specific resource action
 * 
 * @param role - User role
 * @param resource - Resource name
 * @param action - Action name
 * @returns True if permission is 'allowed', false otherwise
 */
export function canAccess(role: UserRole, resource: string, action: string): boolean {
  const permission = getPermissionForResource(role, resource, action)
  return permission === 'allowed'
}

/**
 * Check if a role has readonly access to a resource action
 * 
 * @param role - User role
 * @param resource - Resource name
 * @param action - Action name (typically 'list' or 'show')
 * @returns True if permission is 'readonly', false otherwise
 */
export function isReadonly(role: UserRole, resource: string, action: string): boolean {
  const permission = getPermissionForResource(role, resource, action)
  return permission === 'readonly'
}

/**
 * Get all allowed resources for a role (for menu rendering)
 * 
 * @param role - User role
 * @returns Array of resource names that are not 'disallowed' for 'list' action
 */
export function getAllowedResources(role: UserRole): string[] {
  const roleConfig = ROLE_PERMISSIONS.find((rp) => rp.role === role)
  
  if (!roleConfig) return []
  
  // Get unique resources where 'list' action is not disallowed
  const resources = roleConfig.permissions
    .filter((p) => p.action === 'list' && p.permission !== 'disallowed')
    .map((p) => p.resource)
  
  return Array.from(new Set(resources))
}
