/**
 * Mock Service Worker Browser Setup
 * This file sets up the MSW worker in the browser environment
 */

import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Create and export the worker instance
export const worker = setupWorker(...handlers)