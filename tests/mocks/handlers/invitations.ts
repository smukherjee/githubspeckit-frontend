/**
 * MSW Handlers: Invitations Endpoints
 * 
 * Schema: InvitationResponse (Read-Only Resource)
 * {
 *   id: string
 *   invitation_id: string
 *   email: string
 *   status: "pending" | "accepted" | "expired" | "revoked"
 *   expires_at: string
 *   created_at: string
 *   tenant_id: string
 * }
 * 
 * Note: Invitations are read-only in the UI
 */

import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

const mockInvitations: Array<{
  id: string
  invitation_id: string
  email: string
  status: string
  expires_at: string
  created_at: string
  tenant_id: string
}> = []

export const invitationsHandlers = [
  http.get(`${API_BASE}/invitations`, () => {
    return HttpResponse.json(mockInvitations)
  }),

  http.get(`${API_BASE}/invitations/:id`, ({ params }) => {
    const invitation = mockInvitations.find(
      (i) => i.id === params.id || i.invitation_id === params.id
    )
    if (!invitation) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(invitation)
  }),
]
