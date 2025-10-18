/**
 * Sentry Error Monitoring Configuration
 * 
 * Implements client-side error tracking for:
 * - Runtime errors and exceptions
 * - Unhandled promise rejections
 * - React component errors (via ErrorBoundary)
 * - API errors and network failures
 * - Security events (failed auth, permission denials)
 * 
 * OWASP A09:2021 - Security Logging and Monitoring
 */

import * as Sentry from '@sentry/react'

export interface SecurityEventData {
  userId?: string
  tenantId?: string
  resource?: string
  action?: string
  reason?: string
  [key: string]: unknown
}

/**
 * Initialize Sentry error monitoring
 * Only enabled in production or when VITE_SENTRY_DSN is configured
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.MODE
  
  // Only initialize if DSN is provided
  if (!dsn) {
    console.warn('Sentry: DSN not configured, error monitoring disabled')
    return
  }

  Sentry.init({
    dsn,
    environment,
    
    // Performance monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Capture 100% of sessions with errors for replay
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Performance Monitoring sample rate
    // 10% of transactions in production, 100% in development
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Session Replay sample rates
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    // Filter out sensitive data
    beforeSend(event) {
      // Don't send events in development unless explicitly enabled
      if (environment === 'development' && !import.meta.env.VITE_SENTRY_DEBUG) {
        return null
      }
      
      // Scrub sensitive data from event
      if (event.request?.headers) {
        delete event.request.headers['Authorization']
        delete event.request.headers['Cookie']
      }
      
      // Add user context if available (non-PII)
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          event.user = {
            id: user.user_id,
            email: user.email?.replace(/^(.{3}).*(@.*)$/, '$1***$2'), // Mask email
          }
          event.contexts = {
            ...event.contexts,
            tenant: {
              tenant_id: user.tenant_id,
            },
          }
        } catch {
          // Ignore parsing errors
        }
      }
      
      return event
    },
    
    // Ignore common non-critical errors
    ignoreErrors: [
      // Browser extensions
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Network errors (already logged)
      'Network Error',
      'NetworkError',
      // Cancelled requests
      'AbortError',
      'Request aborted',
    ],
  })
}

/**
 * Log security events to Sentry
 * Examples: failed login, permission denied, unauthorized access
 */
export function logSecurityEvent(
  eventType: 'auth_failed' | 'permission_denied' | 'unauthorized_access' | 'token_expired' | 'invalid_token',
  data: SecurityEventData
) {
  Sentry.captureMessage(
    `Security Event: ${eventType}`,
    {
      level: 'warning',
      tags: {
        event_type: eventType,
        security: true,
      },
      extra: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    }
  )
}

/**
 * Log API errors with context
 */
export function logApiError(
  method: string,
  url: string,
  status: number,
  error: unknown
) {
  Sentry.captureException(error, {
    tags: {
      api_error: true,
      http_method: method,
      http_status: status.toString(),
    },
    extra: {
      url,
      method,
      status,
    },
  })
}

/**
 * Log user actions for audit trail
 * (Only critical actions, not every click)
 */
export function logUserAction(
  action: 'create' | 'update' | 'delete' | 'export' | 'bulk_action',
  resource: string,
  resourceId?: string
) {
  Sentry.addBreadcrumb({
    category: 'user.action',
    message: `${action} ${resource}`,
    level: 'info',
    data: {
      action,
      resource,
      resourceId,
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email: string, tenantId: string) {
  Sentry.setUser({
    id: userId,
    email: email?.replace(/^(.{3}).*(@.*)$/, '$1***$2'), // Mask email
  })
  
  Sentry.setContext('tenant', {
    tenant_id: tenantId,
  })
}

/**
 * Clear user context on logout
 */
export function clearUserContext() {
  Sentry.setUser(null)
}
