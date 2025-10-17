/**
 * MSW Setup Smoke Test
 * 
 * Verifies that MSW mock server is configured correctly and handlers work.
 */

import { describe, it, expect } from 'vitest'

describe('MSW Setup', () => {
  it('should have MSW server configured', () => {
    // This test just verifies the test setup runs without errors
    expect(true).toBe(true)
  })

  it('should be able to make mock API calls', async () => {
    // Test auth login endpoint
    const response = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'infysightsa@infysight.com',
        password: 'infysightsa123',
      }),
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data).toHaveProperty('access_token')
    expect(data).toHaveProperty('user')
    expect(data.user.email).toBe('infysightsa@infysight.com')
  })

  it('should enforce tenant_id requirement for users endpoint', async () => {
    // Test users endpoint WITHOUT tenant_id (should fail)
    const response = await fetch('http://localhost:8000/api/v1/users')

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.detail).toContain('tenant_id')
  })

  it('should return users with tenant_id parameter', async () => {
    // Test users endpoint WITH tenant_id (should succeed)
    const response = await fetch(
      'http://localhost:8000/api/v1/users?tenant_id=tenant-infysight'
    )

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data).toHaveProperty('data')
    expect(data).toHaveProperty('total')
    expect(Array.isArray(data.data)).toBe(true)
  })
})
