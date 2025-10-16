/**
 * MSW Handlers: Audit Events Endpoints (Read-Only)
 */

import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

const mockAuditEvents = [
  {
    event_id: 'event-1',
    tenant_id: 'tenant-infysight',
    actor_id: 'user-sa-1',
    action: 'user.created',
    resource_type: 'user',
    resource_id: 'user-admin-1',
    timestamp: '2025-01-01T00:00:00Z',
    metadata: { ip_address: '192.168.1.1' },
  },
  {
    event_id: 'event-2',
    tenant_id: 'tenant-infysight',
    actor_id: 'user-admin-1',
    action: 'user.updated',
    resource_type: 'user',
    resource_id: 'user-standard-1',
    timestamp: '2025-01-02T00:00:00Z',
    metadata: { changes: ['roles'] },
  },
]

export const auditEventsHandlers = [
  // GET /api/v1/audit/events (read-only, with filters)
  http.get(`${API_BASE}/audit/events`, ({ request }) => {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const actorId = url.searchParams.get('actor_id')
    const action = url.searchParams.get('action')
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')

    if (!tenantId) {
      return HttpResponse.json({ detail: 'tenant_id required' }, { status: 400 })
    }

    // Filter events
    let filtered = mockAuditEvents.filter((e) => e.tenant_id === tenantId)

    if (actorId) {
      filtered = filtered.filter((e) => e.actor_id === actorId)
    }
    if (action) {
      filtered = filtered.filter((e) => e.action === action)
    }
    if (startDate) {
      filtered = filtered.filter((e) => e.timestamp >= startDate)
    }
    if (endDate) {
      filtered = filtered.filter((e) => e.timestamp <= endDate)
    }

    // Pagination
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = parseInt(url.searchParams.get('perPage') || '10')
    const start = (page - 1) * perPage
    const end = start + perPage

    return HttpResponse.json({
      data: filtered.slice(start, end),
      total: filtered.length,
    })
  }),
]
