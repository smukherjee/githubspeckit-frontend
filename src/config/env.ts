/**
 * Environment Configuration Module
 * 
 * Centralized access to environment variables with type safety and validation.
 * All VITE_ environment variables must be accessed through this module.
 */

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || defaultValue
  
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  
  return value
}

// Best Practice: Use relative URLs with proxy configuration
// This avoids CORS issues and follows modern frontend development patterns
// Production deployments typically serve frontend and API from same domain
export const API_BASE_URL = '/api/v1'

export const DEPLOY_MODE = getEnvVar('VITE_DEPLOY_MODE', 'separate') as 'separate' | 'monorepo' | 'distributed'

// Validate deploy mode
if (!['separate', 'monorepo', 'distributed'].includes(DEPLOY_MODE)) {
  throw new Error(`Invalid DEPLOY_MODE: ${DEPLOY_MODE}. Must be one of: separate, monorepo, distributed`)
}

// Export all config as a single object for convenience
export const config = {
  apiBaseUrl: API_BASE_URL,
  deployMode: DEPLOY_MODE,
}
