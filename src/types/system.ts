/**
 * System Type Definitions
 * 
 * Types for system monitoring and configuration endpoints
 */

// Health Check
export interface HealthCheck {
  status: 'ok' | 'degraded' | 'error'
  migrations_applied: boolean
  key_rotation_version: number
}

// Configuration
export interface ConfigEntry {
  value: string | number | boolean
  secret: boolean
}

export interface Config {
  hash: string
  entries: Record<string, ConfigEntry>
}

export interface ConfigError {
  key: string
  error: string
}

export interface ConfigErrors {
  errors: ConfigError[]
}

// Logs
export interface LogRecord {
  ts: string // ISO 8601 timestamp
  level: 'info' | 'warning' | 'error'
  msg: string
  http_method?: string
  path?: string
  status_code?: number
  duration_ms?: number
  tenant_id?: string | null
  correlation_id?: string | null
  trace_id?: string | null
  span_id?: string | null
  had_redaction: boolean
  headers?: Record<string, string>
  [key: string]: unknown // Additional dynamic fields
}

export interface LogsExportResponse {
  records: LogRecord[]
  truncated: boolean
  total_available: number
  reason?: string
}

export interface LogsExportParams {
  limit?: number // Max 10000, default 100
  tenant_id?: string
  category?: 'info' | 'warning' | 'error'
  correlation_id?: string
  since?: string // ISO 8601
  until?: string // ISO 8601
}

// Metrics
export interface MetricsSnapshot {
  metrics: string[]
}
