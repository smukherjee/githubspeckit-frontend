/**
 * MSW Handlers: Policies Endpoints
 */

import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

const mockPolicies = [
  {
    policy_id: 'policy-1',
    tenant_id: 'tenant-infysight',
    resource_type: 'users',
    action: 'read',
    effect: 'ALLOW',
    conditions: {},
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
]

export const policiesHandlers = [
  http.get(`${API_BASE}/policies`, ({ request }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    if (!tenantId) {
      return HttpResponse.json({ detail: 'tenant_id required' }, { status: 400 })
    }
    const filtered = mockPolicies.filter((p) => p.tenant_id === tenantId)
    return HttpResponse.json({ data: filtered, total: filtered.length })
  }),

  http.get(`${API_BASE}/policies/:id`, ({ request, params }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const policy = mockPolicies.find(
      (p) => p.policy_id === params.id && p.tenant_id === tenantId
    )
    if (!policy) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(policy)
  }),

  http.post(`${API_BASE}/policies`, async ({ request }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const body = await request.json() as any
    const newPolicy = {
      policy_id: `policy-${Date.now()}`,
      tenant_id: tenantId!,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockPolicies.push(newPolicy)
    return HttpResponse.json(newPolicy, { status: 201 })
  }),

  http.put(`${API_BASE}/policies/:id`, async ({ request, params }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const index = mockPolicies.findIndex(
      (p) => p.policy_id === params.id && p.tenant_id === tenantId
    )
    if (index === -1) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    const body = await request.json() as any
    mockPolicies[index] = {
      ...mockPolicies[index],
      ...body,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(mockPolicies[index])
  }),

  http.delete(`${API_BASE}/policies/:id`, ({ request, params }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const index = mockPolicies.findIndex(
      (p) => p.policy_id === params.id && p.tenant_id === tenantId
    )
    if (index === -1) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    mockPolicies.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
