/**
 * MSW Handlers: Authentication Endpoints
 * 
 * Mocks for /api/v1/auth/* endpoints including login, refresh, and logout.
 */

import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

// Mock users database
const mockUsers = {
  'infysightsa@infysight.com': {
    user_id: 'user-sa-1',
    tenant_id: 'tenant-infysight',
    email: 'infysightsa@infysight.com',
    roles: ['superadmin'],
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  'infysightadmin@infysight.com': {
    user_id: 'user-admin-1',
    tenant_id: 'tenant-infysight',
    email: 'infysightadmin@infysight.com',
    roles: ['tenant_admin'],
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  'infysightuser@infysight.com': {
    user_id: 'user-standard-1',
    tenant_id: 'tenant-infysight',
    email: 'infysightuser@infysight.com',
    roles: ['standard'],
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
}

export const authHandlers = [
  // POST /api/v1/auth/login
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }

    // Check if user exists
    const user = mockUsers[body.email as keyof typeof mockUsers]
    
    if (!user) {
      return HttpResponse.json(
        { detail: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Simple password check (in real implementation, backend validates)
    const validPasswords: Record<string, string> = {
      'infysightsa@infysight.com': 'Admin@1234',
      'infysightadmin@infysight.com': 'Admin@1234',
      'infysightuser@infysight.com': 'User@1234',
    }

    if (body.password !== validPasswords[body.email]) {
      return HttpResponse.json(
        { detail: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Return successful login response
    return HttpResponse.json({
      access_token: `mock-access-token-${user.user_id}`,
      token_type: 'Bearer',
      expires_in: 900, // 15 minutes
      user,
    })
  }),

  // POST /api/v1/auth/refresh
  http.post(`${API_BASE}/auth/refresh`, () => {
    // In real implementation, backend validates HttpOnly refresh cookie
    // For mock, we just return a new access token
    return HttpResponse.json({
      access_token: 'mock-refreshed-access-token',
      expires_in: 900,
    })
  }),

  // POST /api/v1/auth/logout
  http.post(`${API_BASE}/auth/logout`, () => {
    // Backend would invalidate refresh token
    return new HttpResponse(null, { status: 204 })
  }),

  // POST /api/v1/auth/revoke - Token revocation endpoint
  http.post(`${API_BASE}/auth/revoke`, () => {
    // Backend invalidates the JWT token
    return new HttpResponse(null, { status: 204 })
  }),

  // Error scenario: 403 Forbidden (e.g., disabled user)
  http.post(`${API_BASE}/auth/login/forbidden`, () => {
    return HttpResponse.json(
      { detail: 'Account disabled' },
      { status: 403 }
    )
  }),
]
