/**
 * MSW Handlers: Users Endpoints
 * 
 * Mocks for /api/v1/users/* endpoints with tenant_id injection verification.
 */

import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

// Mock users database
const mockUsers = [
  {
    user_id: 'user-sa-1',
    tenant_id: 'tenant-infysight',
    email: 'infysightsa@infysight.com',
    roles: ['superadmin'],
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    user_id: 'user-admin-1',
    tenant_id: 'tenant-infysight',
    email: 'infysightadmin@infysight.com',
    roles: ['tenant_admin'],
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    user_id: 'user-standard-1',
    tenant_id: 'tenant-infysight',
    email: 'infysightuser@infysight.com',
    roles: ['standard'],
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    user_id: 'user-acme-1',
    tenant_id: 'tenant-acme',
    email: 'admin@acme.com',
    roles: ['tenant_admin'],
    status: 'active',
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
  {
    user_id: 'user-acme-2',
    tenant_id: 'tenant-acme',
    email: 'user@acme.com',
    roles: ['standard'],
    status: 'active',
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
  {
    user_id: 'user-acme-3',
    tenant_id: 'tenant-acme',
    email: 'dev@acme.com',
    roles: ['standard'],
    status: 'active',
    created_at: '2025-01-03T00:00:00Z',
    updated_at: '2025-01-03T00:00:00Z',
  },
]

export const usersHandlers = [
    // GET /api/v1/users (paginated list)
  http.get(`${API_BASE}/users`, ({ request }) => {
    const url = new URL(request.url)
    
    // Parse ra-data-simple-rest format: range=[0,24], sort=["field","ASC"], filter={"field":"value"}
    const rangeParam = url.searchParams.get('range')
    const sortParam = url.searchParams.get('sort')
    const filterParam = url.searchParams.get('filter')

    // Extract tenant_id from either direct query param OR filter object
    let tenantId: string | null = url.searchParams.get('tenant_id') // Direct query param
    const additionalFilters: Record<string, unknown> = {}
    
    if (filterParam) {
      try {
        const filters = JSON.parse(filterParam)
        // Override with tenant_id from filter if present
        if (filters.tenant_id) {
          tenantId = filters.tenant_id
        }
        // Copy other filters (excluding tenant_id)
        Object.keys(filters).forEach((key) => {
          if (key !== 'tenant_id') {
            additionalFilters[key] = filters[key]
          }
        })
      } catch {
        // Ignore invalid filter JSON
      }
    }
    
    // Verify tenant_id is present (required for all requests)
    if (!tenantId) {
      return HttpResponse.json(
        { detail: 'tenant_id query parameter is required' },
        { status: 400 }
      )
    }

    // Filter users by tenant
    let filteredUsers = mockUsers.filter((u) => u.tenant_id === tenantId)

    // Apply additional filters if provided
    Object.keys(additionalFilters).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filteredUsers = filteredUsers.filter((u: any) => {
        if (Array.isArray(additionalFilters[key])) {
          return additionalFilters[key].includes(u[key])
        }
        return u[key] === additionalFilters[key]
      })
    })

    // Apply sorting if provided
    if (sortParam) {
      try {
        const [field, order] = JSON.parse(sortParam)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filteredUsers.sort((a: any, b: any) => {
          if (a[field] < b[field]) return order === 'ASC' ? -1 : 1
          if (a[field] > b[field]) return order === 'ASC' ? 1 : -1
          return 0
        })
      } catch {
        // Ignore invalid sort JSON
      }
    }

    // Apply pagination
    let start = 0
    let end = filteredUsers.length
    let hasRangeParam = false
    
    if (rangeParam) {
      hasRangeParam = true
      try {
        [start, end] = JSON.parse(rangeParam)
        end = end + 1 // range is inclusive, so [0,24] means 25 items
      } catch {
        // Ignore invalid range JSON
        hasRangeParam = false
      }
    }

    // Return different formats based on whether it's ra-data-simple-rest or plain fetch
    if (hasRangeParam) {
      // ra-data-simple-rest format: plain array + Content-Range header
      return HttpResponse.json(
        filteredUsers.slice(start, end),
        {
          headers: {
            'Content-Range': `users ${start}-${Math.min(end - 1, filteredUsers.length - 1)}/${filteredUsers.length}`,
          },
        }
      )
    } else {
      // Plain fetch format: {data: [...], total: ...}
      return HttpResponse.json({
        data: filteredUsers,
        total: filteredUsers.length,
      })
    }
  }),

  // GET /api/v1/users/:id (single user)
  http.get(`${API_BASE}/users/:id`, ({ request, params }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const { id } = params

    if (!tenantId) {
      return HttpResponse.json(
        { detail: 'tenant_id query parameter is required' },
        { status: 400 }
      )
    }

    const user = mockUsers.find((u) => u.user_id === id && u.tenant_id === tenantId)

    if (!user) {
      return HttpResponse.json(
        { detail: 'User not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json(user)
  }),

  // POST /api/v1/users (create user)
  http.post(`${API_BASE}/users`, async ({ request }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    
    if (!tenantId) {
      return HttpResponse.json(
        { detail: 'tenant_id query parameter is required' },
        { status: 400 }
      )
    }

    // Extract user role from Authorization token (mock implementation)
    const authHeader = request.headers.get('Authorization')
    let userRole = 'standard' // Default to most restrictive role
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      // Extract role from mock token format: mock-access-token-{user_id}
      if (token.includes('user-sa-')) {
        userRole = 'superadmin'
      } else if (token.includes('user-admin-')) {
        userRole = 'tenant_admin'
      } else {
        userRole = 'standard'
      }
    }

    // RBAC: Only superadmin and tenant_admin can create users
    if (userRole === 'standard') {
      return HttpResponse.json(
        { detail: 'You do not have permission to create users' },
        { status: 403 }
      )
    }

    const body = await request.json() as {
      email: string
      roles: string[]
      status?: string
    }

    // Create new user
    const newUser = {
      user_id: `user-${Date.now()}`,
      tenant_id: tenantId,
      email: body.email,
      roles: body.roles,
      status: body.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockUsers.push(newUser)

    return HttpResponse.json(newUser, { status: 201 })
  }),

  // PUT /api/v1/users/:id (update user)
  http.put(`${API_BASE}/users/:id`, async ({ request, params }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const { id } = params

    if (!tenantId) {
      return HttpResponse.json(
        { detail: 'tenant_id query parameter is required' },
        { status: 400 }
      )
    }

    // Extract user role from Authorization token (mock implementation)
    const authHeader = request.headers.get('Authorization')
    let userRole = 'standard' // Default to most restrictive role
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      // Extract role from mock token format: mock-access-token-{user_id}
      if (token.includes('user-sa-')) {
        userRole = 'superadmin'
      } else if (token.includes('user-admin-')) {
        userRole = 'tenant_admin'
      } else {
        userRole = 'standard'
      }
    }

    // RBAC: Only superadmin and tenant_admin can update users
    if (userRole === 'standard') {
      return HttpResponse.json(
        { detail: 'You do not have permission to update users' },
        { status: 403 }
      )
    }

    const userIndex = mockUsers.findIndex(
      (u) => u.user_id === id && u.tenant_id === tenantId
    )

    if (userIndex === -1) {
      return HttpResponse.json(
        { detail: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json() as Partial<typeof mockUsers[0]>

    // Update user
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...body,
      updated_at: new Date().toISOString(),
    }

    return HttpResponse.json(mockUsers[userIndex])
  }),

  // DELETE /api/v1/users/:id
  http.delete(`${API_BASE}/users/:id`, ({ request, params }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const { id } = params

    if (!tenantId) {
      return HttpResponse.json(
        { detail: 'tenant_id query parameter is required' },
        { status: 400 }
      )
    }

    // Extract user role from Authorization token (mock implementation)
    const authHeader = request.headers.get('Authorization')
    let userRole = 'standard' // Default to most restrictive role
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      // Extract role from mock token format: mock-access-token-{user_id}
      if (token.includes('user-sa-')) {
        userRole = 'superadmin'
      } else if (token.includes('user-admin-')) {
        userRole = 'tenant_admin'
      } else {
        userRole = 'standard'
      }
    }

    // RBAC: Only superadmin and tenant_admin can delete users
    if (userRole === 'standard') {
      return HttpResponse.json(
        { detail: 'You do not have permission to delete users' },
        { status: 403 }
      )
    }

    const userIndex = mockUsers.findIndex(
      (u) => u.user_id === id && u.tenant_id === tenantId
    )

    if (userIndex === -1) {
      return HttpResponse.json(
        { detail: 'User not found' },
        { status: 404 }
      )
    }

    mockUsers.splice(userIndex, 1)

    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/v1/users/me (current user - NO tenant_id required)
  http.get(`${API_BASE}/users/me`, ({ request }) => {
    // Extract user from Authorization header (mock)
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Authentication required' },
        { status: 401 }
      )
    }

    // For mock, return the superadmin user
    const currentUser = mockUsers[0]

    return HttpResponse.json(currentUser)
  }),
]
