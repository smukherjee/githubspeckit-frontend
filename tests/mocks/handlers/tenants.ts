/**
 * MSW Handlers: Tenants Endpoints
 * 
 * Mocks for /api/v1/tenants/* endpoints (superadmin only).
 */

import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

// Mock tenants database
const mockTenants = [
  {
    tenant_id: 'tenant-infysight',
    name: 'InfySight',
    status: 'active',
    config_version: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    tenant_id: 'tenant-acme',
    name: 'Acme Corp',
    status: 'active',
    config_version: 1,
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
  {
    tenant_id: 'tenant-disabled',
    name: 'Disabled Tenant',
    status: 'disabled',
    config_version: 1,
    created_at: '2025-01-03T00:00:00Z',
    updated_at: '2025-01-03T00:00:00Z',
  },
]

export const tenantsHandlers = [
  // GET /api/v1/tenants (list all - superadmin only, no tenant_id filter)
  http.get(`${API_BASE}/tenants`, ({ request }) => {
    const url = new URL(request.url)
    
    // Pagination
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = parseInt(url.searchParams.get('perPage') || '10')
    const start = (page - 1) * perPage
    const end = start + perPage

    return HttpResponse.json({
      data: mockTenants.slice(start, end),
      total: mockTenants.length,
    })
  }),

  // GET /api/v1/tenants/:id (single tenant)
  http.get(`${API_BASE}/tenants/:id`, ({ params }) => {
    const { id } = params
    const tenant = mockTenants.find((t) => t.tenant_id === id)

    if (!tenant) {
      return HttpResponse.json(
        { detail: 'Tenant not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json(tenant)
  }),

  // POST /api/v1/tenants (create tenant - superadmin only)
  http.post(`${API_BASE}/tenants`, async ({ request }) => {
    const body = await request.json() as {
      name: string
      status?: string
    }

    const newTenant = {
      tenant_id: `tenant-${Date.now()}`,
      name: body.name,
      status: body.status || 'active',
      config_version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockTenants.push(newTenant)

    return HttpResponse.json(newTenant, { status: 201 })
  }),

  // PUT /api/v1/tenants/:id (update tenant)
  http.put(`${API_BASE}/tenants/:id`, async ({ request, params }) => {
    const { id } = params
    const tenantIndex = mockTenants.findIndex((t) => t.tenant_id === id)

    if (tenantIndex === -1) {
      return HttpResponse.json(
        { detail: 'Tenant not found' },
        { status: 404 }
      )
    }

    const body = await request.json() as Partial<typeof mockTenants[0]>

    // Update tenant (increment config_version)
    mockTenants[tenantIndex] = {
      ...mockTenants[tenantIndex],
      ...body,
      config_version: mockTenants[tenantIndex].config_version + 1,
      updated_at: new Date().toISOString(),
    }

    return HttpResponse.json(mockTenants[tenantIndex])
  }),

  // DELETE /api/v1/tenants/:id (soft delete)
  http.delete(`${API_BASE}/tenants/:id`, ({ params }) => {
    const { id } = params
    const tenantIndex = mockTenants.findIndex((t) => t.tenant_id === id)

    if (tenantIndex === -1) {
      return HttpResponse.json(
        { detail: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Soft delete (set status to disabled)
    mockTenants[tenantIndex].status = 'disabled'
    mockTenants[tenantIndex].updated_at = new Date().toISOString()

    return new HttpResponse(null, { status: 204 })
  }),

  // POST /api/v1/tenants/:id/restore (restore deleted tenant)
  http.post(`${API_BASE}/tenants/:id/restore`, ({ params }) => {
    const { id } = params
    const tenantIndex = mockTenants.findIndex((t) => t.tenant_id === id)

    if (tenantIndex === -1) {
      return HttpResponse.json(
        { detail: 'Tenant not found' },
        { status: 404 }
      )
    }

    mockTenants[tenantIndex].status = 'active'
    mockTenants[tenantIndex].updated_at = new Date().toISOString()

    return HttpResponse.json(mockTenants[tenantIndex])
  }),
]
