/**
 * MSW Handlers: Invitations Endpoints
 */

import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

const mockInvitations = [
  {
    invitation_id: 'invite-1',
    tenant_id: 'tenant-infysight',
    email: 'newuser@infysight.com',
    roles: ['standard'],
    status: 'pending',
    expires_at: '2025-12-31T23:59:59Z',
    created_at: '2025-01-01T00:00:00Z',
  },
]

export const invitationsHandlers = [
  http.get(`${API_BASE}/invitations`, ({ request }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    if (!tenantId) {
      return HttpResponse.json({ detail: 'tenant_id required' }, { status: 400 })
    }
    const filtered = mockInvitations.filter((i) => i.tenant_id === tenantId)
    return HttpResponse.json({ data: filtered, total: filtered.length })
  }),

  http.get(`${API_BASE}/invitations/:id`, ({ request, params }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const invitation = mockInvitations.find(
      (i) => i.invitation_id === params.id && i.tenant_id === tenantId
    )
    if (!invitation) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(invitation)
  }),

  http.post(`${API_BASE}/invitations`, async ({ request }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const body = await request.json() as any
    const newInvitation = {
      invitation_id: `invite-${Date.now()}`,
      tenant_id: tenantId!,
      ...body,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    mockInvitations.push(newInvitation)
    return HttpResponse.json(newInvitation, { status: 201 })
  }),

  http.post(`${API_BASE}/invitations/:id/revoke`, ({ request, params }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const index = mockInvitations.findIndex(
      (i) => i.invitation_id === params.id && i.tenant_id === tenantId
    )
    if (index === -1) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    mockInvitations[index].status = 'revoked'
    return HttpResponse.json(mockInvitations[index])
  }),
]
