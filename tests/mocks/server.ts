/**
 * MSW Mock Server Configuration
 * 
 * Sets up Mock Service Worker for API mocking in tests and local development.
 * Intercepts HTTP requests and returns mock responses based on handlers.
 */

import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Create MSW server with all handlers
export const server = setupServer(...handlers)

// Export for use in tests
export { handlers }
