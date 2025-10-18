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
import type { DataProvider, GetListParams, GetOneParams, GetManyParams, GetManyReferenceParams, CreateParams, UpdateParams, UpdateManyParams, DeleteParams, DeleteManyParams } from 'react-admin'
import { API_BASE_URL } from '@/config/env'
import { getUser } from '@/utils/storage'
import { apiClient } from '@/utils/api'

/**
 * Dev-only logging helpers
 * In production builds, these are removed by Terser (drop_console: true)
 */
const isDev = import.meta.env.DEV
// Dev-only logging is acceptable - only runs in development
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const devLog = (...args: any[]) => {
  // eslint-disable-next-line no-console
  if (isDev) console.log(...args)
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const devError = (...args: any[]) => {
  if (isDev) console.error(...args)
}

/**
 * HTTP client that uses the shared apiClient with interceptors
 * Handles meta.tenant_id for query parameters
 * Returns format expected by ra-data-simple-rest
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const httpClient = async (url: string, options?: any) => {
  // Remove any duplicate /api/v1 prefix if it exists
  const cleanUrl = url.startsWith('/api/v1/') ? url.substring(8) : url // Remove "/api/v1/" -> "users/..."
  const finalUrl = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}` // Ensure leading slash
  
  const opts = options || {}
  const config: Record<string, unknown> = {
    method: (opts.method as string) || 'GET',
    url: finalUrl, // Use the cleaned URL
    ...opts,
  }

  if (opts.body) {
    config.data = opts.body
  }

  // Convert Headers object to plain object for axios
  if (opts.headers && opts.headers instanceof Headers) {
    const headersObj: Record<string, string> = {}
    opts.headers.forEach((value: string, key: string) => {
      headersObj[key] = value
    })
    config.headers = headersObj
  }

  // Handle meta for additional query params (e.g., tenant_id)
  const meta = opts.meta as Record<string, string> | undefined
  if (meta && meta.tenant_id) {
    const separator = finalUrl.includes('?') ? '&' : '?'
    config.url = `${finalUrl}${separator}tenant_id=${meta.tenant_id}`
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
    // Enhanced error logging for debugging
    devError('Full error object:', error)
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; data: unknown; statusText?: string } }
      devError('API Error Details:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        url: config.url,
        method: config.method,
        payload: config.data
      })
      
      // If it's a 422, the backend is responding with validation details
      if (axiosError.response?.status === 422) {
        devError('Validation Error from Backend:', axiosError.response.data)
        
        // If the data has a detail array, log each validation error
        const responseData = axiosError.response.data as { detail?: unknown[] }
        if (responseData && responseData.detail && Array.isArray(responseData.detail)) {
          devError('Validation Details:')
          responseData.detail.forEach((validationError: unknown, index: number) => {
            devError(`  ${index + 1}.`, validationError)
          })
        }
      }
    }
    
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
 * Build pagination query params from React-Admin pagination object
 */
function getPaginationParams(pagination?: { page: number; perPage: number }): string {
  const page = pagination?.page || 1
  const perPage = pagination?.perPage || 10
  return `page=${page}&per_page=${perPage}`
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
 * Map frontend resource names to backend API URLs
 * Some resources use different naming conventions on the backend
 */
function getResourceUrl(resource: string): string {
  const urlMap: Record<string, string> = {
    'audit-events': '/audit/events',
    // Add other mappings as needed
  }
  
  return urlMap[resource] || `/${resource}`
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
  // Pass empty base URL since our httpClient (apiClient) already has the base URL configured
  const baseDataProvider = simpleRestProvider('', httpClient)

  const customDataProvider = {
    ...baseDataProvider,

    getList: async (resource: string, params: GetListParams) => {
      // Extract pagination params
      const paginationParams = getPaginationParams(params.pagination)
      
      // Special handling for users resource (backend doesn't return Content-Range header)
      if (resource === 'users') {
        try {
          const tenantId = getTenantId(selectedTenantId)
          const baseUrl = `/users`
          const queryParams = [paginationParams]
          if (tenantId) {
            queryParams.push(`tenant_id=${tenantId}`)
          }
          const url = `${baseUrl}?${queryParams.join('&')}`
          
          const response = await apiClient.get(url)
          
          let users: unknown[] = []
          let total = 0
          
          // Backend may return {"users": [...], "total": N} or just [...]
          if (Array.isArray(response.data)) {
            users = response.data
            total = response.data.length
          } else if (response.data?.users && Array.isArray(response.data.users)) {
            users = response.data.users
            total = response.data.total || users.length
          }
          
          // Map user_id to id for React-Admin
          // Backend returns 'status' field directly (active/disabled/invited)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const usersWithId = users.map((user: any) => ({
            ...user,
            id: user.user_id,
            // Backend already provides status field, no mapping needed
            // Just ensure it has a value
            status: user.status || 'active'
          }))
          
          return { data: usersWithId, total }
        } catch (error) {
          devError('Users request failed:', error)
          return { data: [], total: 0 }
        }
      }

      // Special handling for tenants resource
      if (resource === 'tenants') {
        try {
          const url = `/tenants?${paginationParams}`
          const response = await apiClient.get(url)
          let tenants: unknown[] = []
          let total = 0
          
          // Backend may return an array directly or {tenants: [...], total: N}
          if (Array.isArray(response.data)) {
            tenants = response.data
            total = response.data.length
          } else if (response.data?.tenants && Array.isArray(response.data.tenants)) {
            tenants = response.data.tenants
            total = response.data.total || tenants.length
          }
          
          // Map tenant_id to id for React-Admin
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const tenantsWithId = tenants.map((tenant: any) => ({
            ...tenant,
            id: tenant.tenant_id
          }))
          
          return { data: tenantsWithId, total }
        } catch (error) {
          devError('Tenants request failed:', error)
          return { data: [], total: 0 }
        }
      }

      // Special handling for resources with pagination support
      if (['feature-flags', 'policies', 'audit-events', 'invitations'].includes(resource)) {
        try {
          let url = getResourceUrl(resource)
          const queryParams = [paginationParams]
          
          const tenantId = getTenantId(selectedTenantId)
          if (tenantId && resource !== 'audit-events') {
            // audit-events doesn't need tenant_id filter at the param level
            queryParams.push(`tenant_id=${tenantId}`)
          }
          
          url += `?${queryParams.join('&')}`
          const response = await apiClient.get(url)
          
          // Handle different response formats
          let items: unknown[] = []
          let total = 0
          const data = response.data
          
          if (Array.isArray(data)) {
            items = data
            total = data.length
          } else if (data && typeof data === 'object') {
            // Extract array and total from common response patterns
            // Check for 'items' key first (used by audit/events)
            if (data.items && Array.isArray(data.items)) {
              items = data.items
              total = data.total || items.length
            } else {
              const keys = Object.keys(data)
              const arrayKey = keys.find(k => Array.isArray(data[k]))
              if (arrayKey) {
                items = data[arrayKey]
                total = data.total || items.length
              }
            }
          }
          
          // Map resource-specific ID fields to 'id' for React-Admin
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const itemsWithId = items.map((item: any) => {
            // If already has id, use it; otherwise map from resource-specific field
            if (item.id) {
              return item
            }
            
            let idField: string | undefined
            switch (resource) {
              case 'feature-flags':
                idField = item.flag_id
                break
              case 'policies':
                idField = item.policy_id
                break
              case 'audit-events':
                idField = item.event_id
                break
              case 'invitations':
                idField = item.invitation_id
                break
            }
            
            return {
              ...item,
              id: idField
            }
          })
          
          return { data: itemsWithId, total }
        } catch (error) {
          devError(`${resource} request failed:`, error)
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

    getOne: async (resource: string, params: GetOneParams) => {
      // Special handling for resources with custom URLs
      if (['audit-events', 'invitations'].includes(resource)) {
        const resourceUrl = getResourceUrl(resource)
        const url = `${API_BASE_URL}${resourceUrl}/${params.id}`
        const response = await httpClient(url)
        
        // Map resource-specific ID field to 'id'
        let data = response.json
        if (!data.id) {
          if (resource === 'audit-events' && data.event_id) {
            data = { ...data, id: data.event_id }
          } else if (resource === 'invitations' && data.invitation_id) {
            data = { ...data, id: data.invitation_id }
          }
        }
        
        return { data }
      }
      
      // Inject tenant_id if needed
      if (shouldInjectTenantId(resource, 'getOne')) {
        const tenantId = getTenantId(selectedTenantId)
        if (tenantId) {
          // Call httpClient directly with tenant_id as query param
          const url = `${API_BASE_URL}/${resource}/${params.id}?tenant_id=${tenantId}`
          const response = await httpClient(url)
          let data = response.json
          
          // Map resource-specific ID fields to 'id' for React-Admin
          if (!data.id) {
            if (resource === 'users' && data.user_id) {
              data = { 
                ...data, 
                id: data.user_id,
                // Backend returns status field directly, ensure it has a value
                status: data.status || 'active'
              }
            } else if (resource === 'tenants' && data.tenant_id) {
              data = { ...data, id: data.tenant_id }
            } else if (resource === 'feature-flags' && data.flag_id) {
              data = { ...data, id: data.flag_id }
            } else if (resource === 'policies' && data.policy_id) {
              data = { ...data, id: data.policy_id }
            }
          }
          
          return { data }
        }
      }

      // For base provider call, also map ID fields
      const result = await baseDataProvider.getOne(resource, params)
      let data = result.data
      
      // Map resource-specific ID fields to 'id' for React-Admin
      if (!data.id) {
        if (resource === 'users' && data.user_id) {
          data = { 
            ...data, 
            id: data.user_id,
            // Backend returns status field directly, ensure it has a value
            status: data.status || 'active'
          }
        } else if (resource === 'tenants' && data.tenant_id) {
          data = { ...data, id: data.tenant_id }
        } else if (resource === 'feature-flags' && data.flag_id) {
          data = { ...data, id: data.flag_id }
        } else if (resource === 'policies' && data.policy_id) {
          data = { ...data, id: data.policy_id }
        }
      }
      
      return { data }
    },

    getMany: async (resource: string, params: GetManyParams) => {
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

    getManyReference: async (resource: string, params: GetManyReferenceParams) => {
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

    create: async (resource: string, params: CreateParams) => {
      // Special handling for policies resource - use /register endpoint
      if (resource === 'policies') {
        const tenantId = getTenantId(selectedTenantId)
        
        // Generate policy_id if not provided
        // Format: policy-{resource_type}-{timestamp}
        const policyId = params.data.policy_id || 
          `policy-${params.data.resource_type || 'default'}-${Date.now()}`
        
        try {
          const payload = {
            policy_id: policyId,
            version: params.data.version || 1,
            resource_type: params.data.resource_type,
            condition_expression: params.data.condition_expression,
            effect: (params.data.effect || 'Allow').toLowerCase(), // Backend expects lowercase
            tenant_id: tenantId,
          }
          
          devLog('Creating policy with payload:', JSON.stringify(payload, null, 2))
          
          const response = await apiClient.post('/policies/register', payload)
          
          let data = response.data
          // Map policy_id to id if needed
          if (!data.id && data.policy_id) {
            data = { ...data, id: data.policy_id }
          }
          
          return { data }
        } catch (error) {
          devError('Policy registration failed:', error)
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
          // Add tenant_id to both query param and body
          const url = `${API_BASE_URL}/${resource}?tenant_id=${tenantId}`
          
          // For user creation, include tenant_id in the request body
          const bodyData = resource === 'users' 
            ? { ...params.data, tenant_id: tenantId }
            : params.data
          
          // Debug: Log the request payload
          devLog(`Creating ${resource} with payload:`, JSON.stringify(bodyData, null, 2))
          
          const response = await httpClient(url, {
            method: 'POST',
            body: JSON.stringify(bodyData),
          })
          let data = response.json
          
          // Map resource-specific ID fields to 'id' for React-Admin
          if (!data.id) {
            if (resource === 'users' && data.user_id) {
              data = { ...data, id: data.user_id }
            } else if (resource === 'tenants' && data.tenant_id) {
              data = { ...data, id: data.tenant_id }
            } else if (resource === 'feature-flags' && data.flag_id) {
              data = { ...data, id: data.flag_id }
            } else if (resource === 'policies' && data.policy_id) {
              data = { ...data, id: data.policy_id }
            }
          }
          
          return { data }
        }
      }

      const result = await baseDataProvider.create(resource, params)
      let data = result.data
      
      // Map resource-specific ID fields to 'id' for React-Admin
      if (!data.id) {
        if (resource === 'users' && data.user_id) {
          data = { ...data, id: data.user_id }
        } else if (resource === 'tenants' && data.tenant_id) {
          data = { ...data, id: data.tenant_id }
        } else if (resource === 'feature-flags' && data.flag_id) {
          data = { ...data, id: data.flag_id }
        } else if (resource === 'policies' && data.policy_id) {
          data = { ...data, id: data.policy_id }
        }
      }
      
      return { data }
    },

    update: async (resource: string, params: UpdateParams) => {
      devLog(`📝 dataProvider.update called for resource: ${resource}`, params);
      
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
          // Add tenant_id as query param
          const url = `${API_BASE_URL}/${resource}/${params.id}?tenant_id=${tenantId}`
          
          // Process the data based on resource type
          let requestData = params.data;
          
          // Special handling for users resource
          if (resource === 'users') {
            // Backend expects 'is_disabled' boolean field, not 'status' string
            // Frontend uses status: 'active' | 'disabled' | 'invited'
            // Backend update endpoint only accepts is_disabled: true | false
            const isDisabled = params.data.status === 'disabled' ? true : false;
            
            requestData = {
              email: params.data.email,
              roles: params.data.roles,
              is_disabled: isDisabled, // Map status to is_disabled
              tenant_id: tenantId // Include tenant_id in the request body
            };
            
            // Debug the request
            devLog(`🚀 Updating user with payload:`, JSON.stringify(requestData, null, 2));
            devLog(`  Mapped status '${params.data.status}' to is_disabled=${isDisabled}`);
          }
          
          let response;
          try {
            response = await httpClient(url, {
              method: 'PUT',
              body: JSON.stringify(requestData),
            })
            devLog(`✅ Update successful, response:`, response.json);
          } catch (error) {
            devError(`❌ Update failed:`, error);
            throw error;
          }
          let data = response.json
          
          // Map resource-specific ID fields to 'id' for React-Admin
          if (!data.id) {
            if (resource === 'users' && data.user_id) {
              data = { 
                ...data, 
                id: data.user_id,
                // Backend returns status field directly, ensure it has a value
                status: data.status || 'active'
              }
            } else if (resource === 'tenants' && data.tenant_id) {
              data = { ...data, id: data.tenant_id }
            } else if (resource === 'feature-flags' && data.flag_id) {
              data = { ...data, id: data.flag_id }
            } else if (resource === 'policies' && data.policy_id) {
              data = { ...data, id: data.policy_id }
            }
          }
          
          return { data }
        }
      }

      const result = await baseDataProvider.update(resource, params)
      let data = result.data
      
      // Map resource-specific ID fields to 'id' for React-Admin
      if (!data.id) {
        if (resource === 'users' && data.user_id) {
          data = { ...data, id: data.user_id }
        } else if (resource === 'tenants' && data.tenant_id) {
          data = { ...data, id: data.tenant_id }
        } else if (resource === 'feature-flags' && data.flag_id) {
          data = { ...data, id: data.flag_id }
        } else if (resource === 'policies' && data.policy_id) {
          data = { ...data, id: data.policy_id }
        }
      }
      
      return { data }
    },

    updateMany: async (resource: string, params: UpdateManyParams) => {
      devLog(`📝 dataProvider.updateMany called for resource: ${resource}`, params);
      
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

    delete: async (resource: string, params: DeleteParams) => {
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
          // Add tenant_id as query param
          const url = `${API_BASE_URL}/${resource}/${params.id}?tenant_id=${tenantId}`
          const response = await httpClient(url, { method: 'DELETE' })
          return { data: response.json }
        }
      }

      return baseDataProvider.delete(resource, params)
    },

    deleteMany: async (resource: string, params: DeleteManyParams) => {
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
  
  devLog('✨ DataProvider created, update method exists:', typeof customDataProvider.update === 'function');
  return customDataProvider;
}

/**
 * Default dataProvider instance (no tenant selection)
 * Use this for non-superadmin users or wrap with TenantContext for superadmin
 */
export const dataProvider = createDataProvider()
