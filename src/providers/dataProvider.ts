/**
 * Data Provider for React-Admin
 *
 * Wraps ra-data-simple-rest with tenant_id injection middleware:
 * - Automatically injects ?tenant_id={id} query parameter in all requests
 * - Superadmin: Uses selectedTenantId from TenantContext
 * - Tenant_admin/standard: Uses tenant_id from user JWT claim
 * - Exception: GET /api/v1/users/me does NOT include tenant_id
 * - Exception: /api/v1/tenants resource does NOT include tenant_id (superadmin-only)
 */

import simpleRestProvider from 'ra-data-simple-rest'
import type { DataProvider } from 'react-admin'
import { API_BASE_URL } from '@/config/env'
import { getUser } from '@/utils/storage'
import { apiClient } from '@/utils/api'

/**
 * HTTP client that uses the shared apiClient with interceptors
 * Handles meta.tenant_id for query parameters
 * Returns format expected by ra-data-simple-rest
 */
const httpClient = async (url: string, options?: Record<string, unknown>) => {
  const opts = options || {}
  const config: Record<string, unknown> = {
    method: (opts.method as string) || 'GET',
    url,
    ...opts,
  }

  if (opts.body) {
    config.data = opts.body
  }

  // Handle meta for additional query params (e.g., tenant_id)
  const meta = opts.meta as Record<string, string> | undefined
  if (meta && meta.tenant_id) {
    const separator = url.includes('?') ? '&' : '?'
    config.url = `${url}${separator}tenant_id=${meta.tenant_id}`
  }

  try {
    const response = await apiClient.request(config as Record<string, unknown>)

    const headersList: Array<[string, string]> = []
    for (const [key, value] of Object.entries(response.headers)) {
      headersList.push([key, String(value)])
    }

    return {
      status: response.status,
      headers: new Headers(headersList),
      body: JSON.stringify(response.data),
      json: response.data,
    }
  } catch (error) {
    // Re-throw with meaningful error message to prevent Polyglot translation errors
    if (error instanceof Error) {
      throw new Error(error.message || 'Request failed')
    }
    throw new Error('Request failed')
  }
}

/**
 * Get the tenant_id for API requests
 * - Superadmin: Uses selectedTenantId from context (passed as parameter)
 * - Others: Uses tenant_id from user object in localStorage
 */
function getTenantId(selectedTenantId?: string | null): string | null {
  const user = getUser()

  if (!user) {
    return null
  }

  // If superadmin and tenant is selected, use selected tenant
  if (user.roles.includes('superadmin') && selectedTenantId) {
    return selectedTenantId
  }

  // Otherwise use user's own tenant_id
  return user.tenant_id || null
}

/**
 * Check if tenant_id should be injected for this request
 * Returns false for:
 * - GET /api/v1/users/me
 * - All requests to /api/v1/tenants (superadmin-only resource)
 */
function shouldInjectTenantId(resource: string, type: string): boolean {
  // Never inject tenant_id for tenants resource (superadmin-only)
  if (resource === 'tenants') {
    return false
  }

  // Never inject tenant_id for GET /users/me
  if (resource === 'users' && type === 'getIdentity') {
    return false
  }

  return true
}

/**
 * Create dataProvider with tenant_id injection
 *
 * @param selectedTenantId - Optional tenant_id for superadmin tenant switching
 * @returns DataProvider instance with tenant_id middleware
 */
export function createDataProvider(
  selectedTenantId?: string | null
): DataProvider {
  const baseDataProvider = simpleRestProvider(API_BASE_URL, httpClient as any)

  return {
    ...baseDataProvider,

    getList: async (resource, params) => {
      // Special handling for tenants resource
      if (resource === 'tenants') {
        try {
          const response = await apiClient.get('/tenants')
          let tenants: Record<string, unknown>[] = []
          
          // Backend returns an array directly, not {tenants: [...]}
          if (Array.isArray(response.data)) {
            tenants = response.data
          } else if (response.data?.tenants && Array.isArray(response.data.tenants)) {
            tenants = response.data.tenants
          }
          
          return { data: tenants, total: tenants.length }
        } catch (error) {
          console.error('Tenants request failed:', error)
          return { data: [], total: 0 }
        }
      }

      // Special handling for resources that don't support standard pagination params
      if (['feature-flags', 'policies', 'audit-events', 'invitations'].includes(resource)) {
        try {
          let url = `/${resource}`
          const tenantId = getTenantId(selectedTenantId)
          if (tenantId && resource !== 'audit-events') {
            // audit-events doesn't need tenant_id filter at the param level
            url += `?tenant_id=${tenantId}`
          }
          const response = await apiClient.get(url)
          
          // Handle different response formats
          const data = response.data
          if (Array.isArray(data)) {
            return { data, total: data.length }
          } else if (data && typeof data === 'object') {
            // Extract array from common response patterns
            const keys = Object.keys(data)
            const arrayKey = keys.find(k => Array.isArray(data[k]))
            if (arrayKey) {
              const arr = data[arrayKey]
              return { data: arr, total: arr.length }
            }
          }
          
          return { data: [], total: 0 }
        } catch (error) {
          console.error(`${resource} request failed:`, error)
          return { data: [], total: 0 }
        }
      }

      // Inject tenant_id if needed
      if (shouldInjectTenantId(resource, 'getList')) {
        const tenantId = getTenantId(selectedTenantId)
        if (tenantId) {
          params.filter = {
            ...params.filter,
            tenant_id: tenantId,
          }
        }
      }

      return baseDataProvider.getList(resource, params)
    },

    getOne: async (resource, params) => {
      // Inject tenant_id if needed
      if (shouldInjectTenantId(resource, 'getOne')) {
        const tenantId = getTenantId(selectedTenantId)
        if (tenantId) {
          // ra-data-simple-rest doesn't support filter in getOne
          // We'll append tenant_id as query param manually via meta
          params.meta = {
            ...params.meta,
            tenant_id: tenantId,
          }
        }
      }

      return baseDataProvider.getOne(resource, params)
    },

    getMany: async (resource, params) => {
      // Inject tenant_id if needed
      if (shouldInjectTenantId(resource, 'getMany')) {
        const tenantId = getTenantId(selectedTenantId)
        if (tenantId) {
          params.meta = {
            ...params.meta,
            tenant_id: tenantId,
          }
        }
      }

      return baseDataProvider.getMany(resource, params)
    },

    getManyReference: async (resource, params) => {
      // Inject tenant_id if needed
      if (shouldInjectTenantId(resource, 'getManyReference')) {
        const tenantId = getTenantId(selectedTenantId)
        if (tenantId) {
          params.filter = {
            ...params.filter,
            tenant_id: tenantId,
          }
        }
      }

      return baseDataProvider.getManyReference(resource, params)
    },

    create: async (resource, params) => {
      // Special handling for policies: use /policies/register endpoint
      if (resource === 'policies') {
        try {
          const response = await apiClient.post('/policies/register', params.data)
          return { data: response.data }
        } catch (error) {
          console.error('Policy registration failed:', error)
          throw error
        }
      }

      // Disable create for invitations (read-only, only accept endpoint supported)
      if (resource === 'invitations') {
        throw new Error('Invitations are read-only. Use the accept endpoint to accept invitations.')
      }

      // Special handling for feature-flags: include tenant_id in payload
      if (resource === 'feature-flags') {
        const tenantId = getTenantId(selectedTenantId)
        if (tenantId) {
          params.data = {
            ...params.data,
            tenant_id: tenantId,
          }
        }
      }

      // Inject tenant_id if needed
      if (shouldInjectTenantId(resource, 'create')) {
        const tenantId = getTenantId(selectedTenantId)
        if (tenantId) {
          params.data = {
            ...params.data,
            tenant_id: tenantId,
          }
        }
      }

      return baseDataProvider.create(resource, params)
    },

    update: async (resource, params) => {
      // Disable update for audit-events (read-only)
      if (resource === 'audit-events') {
        throw new Error('Audit events are read-only.')
      }

      // Disable update for invitations (read-only, only accept endpoint supported)
      if (resource === 'invitations') {
        throw new Error('Invitations are read-only. Use the accept endpoint to accept invitations.')
      }

      // Inject tenant_id if needed
      if (shouldInjectTenantId(resource, 'update')) {
        const tenantId = getTenantId(selectedTenantId)
        if (tenantId) {
          params.data = {
            ...params.data,
            tenant_id: tenantId,
          }
        }
      }

      return baseDataProvider.update(resource, params)
    },

    updateMany: async (resource, params) => {
      // Inject tenant_id if needed
      if (shouldInjectTenantId(resource, 'updateMany')) {
        const tenantId = getTenantId(selectedTenantId)
        if (tenantId) {
          params.meta = {
            ...params.meta,
            tenant_id: tenantId,
          }
        }
      }

      return baseDataProvider.updateMany(resource, params)
    },

    delete: async (resource, params) => {
      // Disable delete for audit-events (read-only)
      if (resource === 'audit-events') {
        throw new Error('Audit events are read-only.')
      }

      // Disable delete for invitations (read-only, only revoke endpoint supported)
      if (resource === 'invitations') {
        throw new Error('Invitations cannot be deleted. Use the revoke endpoint to revoke invitations.')
      }

      // Inject tenant_id if needed
      if (shouldInjectTenantId(resource, 'delete')) {
        const tenantId = getTenantId(selectedTenantId)
        if (tenantId) {
          params.meta = {
            ...params.meta,
            tenant_id: tenantId,
          }
        }
      }

      return baseDataProvider.delete(resource, params)
    },

    deleteMany: async (resource, params) => {
      // Inject tenant_id if needed
      if (shouldInjectTenantId(resource, 'deleteMany')) {
        const tenantId = getTenantId(selectedTenantId)
        if (tenantId) {
          params.meta = {
            ...params.meta,
            tenant_id: tenantId,
          }
        }
      }

      return baseDataProvider.deleteMany(resource, params)
    },
  }
}

/**
 * Default dataProvider instance (no tenant selection)
 * Use this for non-superadmin users or wrap with TenantContext for superadmin
 */
export const dataProvider = createDataProvider()
