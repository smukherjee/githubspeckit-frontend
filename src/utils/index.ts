/**
 * Utilities Index (T025-T028)
 * 
 * Centralized export for all utility modules.
 * Import from '@/utils' to access utilities.
 */

// API client (T026)
export { apiClient, default as api } from './api'

// Storage utilities (T027)
export {
  getAccessToken,
  setAccessToken,
  getUser,
  setUser,
  clearAuth,
  clearUser,
} from './storage'

// Permission utilities (T028)
export {
  ROLE_PERMISSIONS,
  getPermissionForResource,
  canAccess,
  isReadonly,
  getAllowedResources,
} from './permissions'
