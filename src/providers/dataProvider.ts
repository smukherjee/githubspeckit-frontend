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
const httpClient = async (url: string, options: any = {}) => {
  const config: any = {
    method: options.method || 'GET',
    url,
    ...options,
  }

  if (options.body) {
    config.data = options.body
  }

  // Handle meta for additional query params (e.g., tenant_id)
  if (options.meta && options.meta.tenant_id) {
    const separator = url.includes('?') ? '&' : '?'
    config.url = `${url}${separator}tenant_id=${options.meta.tenant_id}`
  }

  const response = await apiClient(config)

  return {
    status: response.status,
    headers: new Headers(response.headers as any),
    body: JSON.stringify(response.data),
    json: response.data,
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
  const baseDataProvider = simpleRestProvider(API_BASE_URL, httpClient)

  return {
    ...baseDataProvider,

    getList: async (resource, params) => {
      // Special handling for tenants resource
      if (resource === 'tenants') {
        const response = await apiClient.get('/tenants')
        const tenants = response.data.tenants || []
        return { data: tenants, total: tenants.length }
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
      // Inject tenant_id if needed
      if (shouldInjectTenantId(resource, 'create')) {
        const tenantId = getTenantId(selectedTenantId)
        if (tenantId) {
          params.meta = {
            ...params.meta,
            tenant_id: tenantId,
          }
        }
      }

      return baseDataProvider.create(resource, params)
    },

    update: async (resource, params) => {
      // Inject tenant_id if needed
      if (shouldInjectTenantId(resource, 'update')) {
        const tenantId = getTenantId(selectedTenantId)
        if (tenantId) {
          params.meta = {
            ...params.meta,
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
