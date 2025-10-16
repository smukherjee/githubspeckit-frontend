/**
 * MSW Handlers: Policies Endpoints
 * 
 * Schema: PolicyResponse
 * {
 *   id: string
 *   policy_id: string
 *   version: number
 *   resource_type: string
 *   condition_expression: string
 *   effect: "Allow" | "Deny"
 *   created_by?: string
 *   created_at?: string
 * }
 * 
 * Note: Create uses /policies/register endpoint (PolicyRegistrationRequest)
 */

import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

const mockPolicies: Array<{
  id: string
  policy_id: string
  version: number
  resource_type: string
  condition_expression: string
  effect: string
  created_by?: string
  created_at?: string
}> = [
  {
    id: 'policy-id-1',
    policy_id: 'policy-1',
    version: 1,
    resource_type: 'users',
    condition_expression: "user.role == 'admin'",
    effect: 'Allow',
    created_by: 'system',
    created_at: '2025-01-01T00:00:00Z',
  },
]

export const policiesHandlers = [
  http.get(`${API_BASE}/policies`, () => {
    return HttpResponse.json(mockPolicies)
  }),

  http.get(`${API_BASE}/policies/:id`, ({ params }) => {
    const policy = mockPolicies.find(
      (p) => p.id === params.id || p.policy_id === params.id
    )
    if (!policy) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(policy)
  }),

  // Create via /policies/register endpoint (special endpoint)
  http.post(`${API_BASE}/policies/register`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const newPolicy = {
      id: `policy-id-${Date.now()}`,
      policy_id: body.policy_id as string,
      version: body.version as number,
      resource_type: body.resource_type as string,
      condition_expression: body.condition_expression as string,
      effect: body.effect as string,
      created_by: 'test-user',
      created_at: new Date().toISOString(),
    }
    mockPolicies.push(newPolicy)
    return HttpResponse.json(newPolicy, { status: 201 })
  }),

  http.put(`${API_BASE}/policies/:id`, async ({ request, params }) => {
    const index = mockPolicies.findIndex(
      (p) => p.id === params.id || p.policy_id === params.id
    )
    if (index === -1) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    const body = (await request.json()) as Record<string, unknown>
    mockPolicies[index] = {
      ...mockPolicies[index],
      ...(body as unknown as typeof mockPolicies[0]),
    }
    return HttpResponse.json(mockPolicies[index])
  }),

  http.delete(`${API_BASE}/policies/:id`, ({ params }) => {
    const index = mockPolicies.findIndex(
      (p) => p.id === params.id || p.policy_id === params.id
    )
    if (index === -1) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    mockPolicies.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
