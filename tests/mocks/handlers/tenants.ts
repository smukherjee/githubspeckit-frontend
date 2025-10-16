/**
 * MSW Handlers: Tenants Endpoints
 * 
 * Schema: TenantResponse
 * {
 *   id: string
 *   tenant_id: string
 *   name: string
 *   status: "active" | "disabled"
 *   config_version: number
 *   created_at: string
 *   updated_at: string
 * }
 * 
 * Note: Tenants are superadmin-only resource
 */

import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

// Mock tenants database
const mockTenants: Array<{
  id: string
  tenant_id: string
  name: string
  status: string
  config_version: number
  created_at: string
  updated_at: string
}> = [
  {
    id: 'tenant-1',
    tenant_id: 'tenant-1',
    name: 'Tenant One',
    status: 'active',
    config_version: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'tenant-2',
    tenant_id: 'tenant-2',
    name: 'Tenant Two',
    status: 'active',
    config_version: 1,
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
  {
    id: 'tenant-3',
    tenant_id: 'tenant-3',
    name: 'Tenant Three',
    status: 'disabled',
    config_version: 1,
    created_at: '2025-01-03T00:00:00Z',
    updated_at: '2025-01-03T00:00:00Z',
  },
]

export const tenantsHandlers = [
  // GET /api/v1/tenants (list all - superadmin only)
  http.get(`${API_BASE}/tenants`, () => {
    return HttpResponse.json(mockTenants)
  }),

  // GET /api/v1/tenants/:id (single tenant)
  http.get(`${API_BASE}/tenants/:id`, ({ params }) => {
    const tenant = mockTenants.find(
      (t) => t.id === params.id || t.tenant_id === params.id
    )

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
    const body = (await request.json()) as Record<string, unknown>

    const newTenant = {
      id: `tenant-id-${Date.now()}`,
      tenant_id: `tenant-${Date.now()}`,
      name: body.name as string,
      status: (body.status as string) || 'active',
      config_version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockTenants.push(newTenant)

    return HttpResponse.json(newTenant, { status: 201 })
  }),

  // PUT /api/v1/tenants/:id (update tenant)
  http.put(`${API_BASE}/tenants/:id`, async ({ request, params }) => {
    const tenantIndex = mockTenants.findIndex(
      (t) => t.id === params.id || t.tenant_id === params.id
    )

    if (tenantIndex === -1) {
      return HttpResponse.json(
        { detail: 'Tenant not found' },
        { status: 404 }
      )
    }

    const body = (await request.json()) as Record<string, unknown>

    // Update tenant (increment config_version)
    mockTenants[tenantIndex] = {
      ...mockTenants[tenantIndex],
      ...(body as unknown as typeof mockTenants[0]),
      config_version: mockTenants[tenantIndex].config_version + 1,
      updated_at: new Date().toISOString(),
    }

    return HttpResponse.json(mockTenants[tenantIndex])
  }),

  // DELETE /api/v1/tenants/:id (soft delete)
  http.delete(`${API_BASE}/tenants/:id`, ({ params }) => {
    const tenantIndex = mockTenants.findIndex(
      (t) => t.id === params.id || t.tenant_id === params.id
    )

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
]
