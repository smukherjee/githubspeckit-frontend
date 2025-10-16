/**
 * Tenant Type Definitions (T022 - Part 1 of 5)
 * 
 * Multi-tenant isolation entity. Each tenant represents an organization with isolated data.
 * Status: active (operational), disabled (soft-deleted, can be restored)
 * Config_version: incremented on update for optimistic locking
 */

export type TenantStatus = 'active' | 'disabled'

export interface Tenant {
  tenant_id: string
  name: string
  status: TenantStatus
  config_version: number
  created_at: string // ISO 8601 datetime
  updated_at: string // ISO 8601 datetime
}
