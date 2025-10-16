/**
 * Permission Type Definitions (T024)
 * 
 * RBAC permission configuration for screen-level authorization.
 * Permission levels:
 * - allowed: Full access (create, read, update, delete)
 * - readonly: Read access only (list, show)
 * - disallowed: No access (hide from menu, redirect to 403)
 * 
 * Used by react-admin resource configuration to show/hide UI elements.
 */

export type PermissionLevel = 'allowed' | 'readonly' | 'disallowed'

export interface ResourcePermission {
  resource: string // e.g., "users", "tenants", "policies"
  action: string // e.g., "list", "show", "create", "edit", "delete"
  permission: PermissionLevel
}

export interface RolePermissions {
  role: string // e.g., "superadmin", "tenant_admin", "standard"
  permissions: ResourcePermission[]
}

/**
 * Shared type for paginated API responses
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
}

/**
 * Shared type for API error responses
 */
export interface ApiError {
  detail: string // Error message
  status: number // HTTP status code
}
