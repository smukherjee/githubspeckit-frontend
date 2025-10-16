/**
 * MSW Handlers: Feature Flags Endpoints
 * 
 * Schema: FeatureFlagResponse
 * {
 *   id: string
 *   flag_id: string
 *   key: string
 *   state: "enabled" | "disabled"
 *   variant?: string
 *   tenant_id: string
 * }
 */

import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

const mockFeatureFlags: Array<{
  id: string
  flag_id: string
  tenant_id: string
  key: string
  state: string
  variant?: string
  created_at: string
  updated_at: string
}> = [
  {
    id: 'ff-id-1',
    flag_id: 'flag-1',
    tenant_id: 'tenant-infysight',
    key: 'enable_advanced_reporting',
    state: 'enabled',
    variant: 'default',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
]

export const featureFlagsHandlers = [
  http.get(`${API_BASE}/feature-flags`, ({ request }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    if (!tenantId) {
      return HttpResponse.json({ detail: 'tenant_id required' }, { status: 400 })
    }
    const filtered = mockFeatureFlags.filter((f) => f.tenant_id === tenantId)
    return HttpResponse.json(filtered)
  }),

  http.get(`${API_BASE}/feature-flags/:id`, ({ request, params }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const flag = mockFeatureFlags.find(
      (f) => (f.id === params.id || f.flag_id === params.id) && f.tenant_id === tenantId
    )
    if (!flag) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(flag)
  }),

  http.post(`${API_BASE}/feature-flags`, async ({ request }) => {
    const url = new URL(request.url)
    const body = (await request.json()) as Record<string, unknown>
    const tenantId = url.searchParams.get('tenant_id') || (body.tenant_id as string)
    const newFlag = {
      id: `ff-id-${Date.now()}`,
      flag_id: `flag-${Date.now()}`,
      tenant_id: tenantId!,
      key: body.key as string,
      state: (body.state as string) || 'disabled',
      variant: body.variant ? (body.variant as string) : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockFeatureFlags.push(newFlag)
    return HttpResponse.json(newFlag, { status: 201 })
  }),

  http.put(`${API_BASE}/feature-flags/:id`, async ({ request, params }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const index = mockFeatureFlags.findIndex(
      (f) => (f.id === params.id || f.flag_id === params.id) && f.tenant_id === tenantId
    )
    if (index === -1) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    const body = (await request.json()) as Record<string, unknown>
    mockFeatureFlags[index] = {
      ...mockFeatureFlags[index],
      ...(body as unknown as typeof mockFeatureFlags[0]),
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(mockFeatureFlags[index])
  }),

  http.delete(`${API_BASE}/feature-flags/:id`, ({ request, params }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const index = mockFeatureFlags.findIndex(
      (f) => (f.id === params.id || f.flag_id === params.id) && f.tenant_id === tenantId
    )
    if (index === -1) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    mockFeatureFlags.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
