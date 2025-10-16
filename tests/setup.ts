/**
 * Test Setup Configuration
 * 
 * Global setup for all tests including MSW server lifecycle and testing-library extensions.
 */

import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { server } from './mocks/server'

// Start MSW server before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn', // Warn about requests without handlers
  })
})

// Reset handlers after each test to ensure test isolation
afterEach(() => {
  server.resetHandlers()
  cleanup() // Cleanup React Testing Library
})

// Close MSW server after all tests
afterAll(() => {
  server.close()
})
