/**
 * MSW Handlers: Audit Events Endpoints (Read-Only)
 * 
 * Schema: AuditEventResponse (Read-Only Resource)
 * {
 *   id: string
 *   event_id: string
 *   action: string
 *   category: string
 *   actor_user_id: string
 *   actor_id: string
 *   resource_type: string
 *   resource_id: string
 *   target: string
 *   metadata: Record<string, unknown>
 *   timestamp: string
 *   tenant_id: string
 * }
 * 
 * Note: Audit Events are read-only in the UI
 */

import { http, HttpResponse } from 'msw'

const API_BASE = '/api/v1'

const mockAuditEvents: Array<{
  id: string
  event_id: string
  action: string
  category: string
  actor_user_id: string
  actor_id: string
  resource_type: string
  resource_id: string
  target: string
  metadata: Record<string, unknown>
  timestamp: string
  tenant_id: string
}> = [
  {
    id: 'audit-1',
    event_id: 'event-1',
    action: 'user_created',
    category: 'USER_MANAGEMENT',
    actor_user_id: 'user-sa-1',
    actor_id: 'user-sa-1',
    resource_type: 'user',
    resource_id: 'user-admin-1',
    target: 'admin@example.com',
    metadata: { ip_address: '192.168.1.1' },
    timestamp: '2025-01-01T00:00:00Z',
    tenant_id: 'tenant-1',
  },
  {
    id: 'audit-2',
    event_id: 'event-2',
    action: 'user_updated',
    category: 'USER_MANAGEMENT',
    actor_user_id: 'user-admin-1',
    actor_id: 'user-admin-1',
    resource_type: 'user',
    resource_id: 'user-standard-1',
    target: 'standard@example.com',
    metadata: { changes: ['roles'] },
    timestamp: '2025-01-02T00:00:00Z',
    tenant_id: 'tenant-1',
  },
  {
    id: 'audit-3',
    event_id: 'event-3',
    action: 'policy_created',
    category: 'POLICY_MANAGEMENT',
    actor_user_id: 'user-admin-1',
    actor_id: 'user-admin-1',
    resource_type: 'policy',
    resource_id: 'policy-1',
    target: 'policy-1',
    metadata: { effect: 'Allow' },
    timestamp: '2025-01-03T00:00:00Z',
    tenant_id: 'tenant-1',
  },
  {
    id: 'audit-4',
    event_id: 'event-4',
    action: 'tenant_settings_updated',
    category: 'TENANT_MANAGEMENT',
    actor_user_id: 'user-sa-1',
    actor_id: 'user-sa-1',
    resource_type: 'tenant',
    resource_id: 'tenant-1',
    target: 'tenant-1',
    metadata: { setting: 'max_users', old_value: 100, new_value: 150 },
    timestamp: '2025-01-04T00:00:00Z',
    tenant_id: 'tenant-1',
  },
]

export const auditEventsHandlers = [
  // GET /api/v1/audit/events (read-only, with filters)
  http.get(`${API_BASE}/audit/events`, () => {
    return HttpResponse.json(mockAuditEvents)
  }),

  // GET /api/v1/audit-events (alternative path for react-admin)
  http.get(`${API_BASE}/audit-events`, () => {
    return HttpResponse.json(mockAuditEvents)
  }),

  http.get(`${API_BASE}/audit/events/:id`, ({ params }) => {
    const event = mockAuditEvents.find(
      (e) => e.id === params.id || e.event_id === params.id
    )
    if (!event) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(event)
  }),

  http.get(`${API_BASE}/audit-events/:id`, ({ params }) => {
    const event = mockAuditEvents.find(
      (e) => e.id === params.id || e.event_id === params.id
    )
    if (!event) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(event)
  }),
]
