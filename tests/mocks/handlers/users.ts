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
]

export const usersHandlers = [
  // GET /api/v1/users (paginated list)
  http.get(`${API_BASE}/users`, ({ request }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    
    // Verify tenant_id is present (required for all requests except /me)
    if (!tenantId) {
      return HttpResponse.json(
        { detail: 'tenant_id query parameter is required' },
        { status: 400 }
      )
    }

    // Filter users by tenant
    const filteredUsers = mockUsers.filter((u) => u.tenant_id === tenantId)

    // Pagination params (react-admin defaults)
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = parseInt(url.searchParams.get('perPage') || '10')
    const start = (page - 1) * perPage
    const end = start + perPage

    return HttpResponse.json({
      data: filteredUsers.slice(start, end),
      total: filteredUsers.length,
    })
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
