/**
 * Feature Flag Type Definitions (T022 - Part 2 of 5)
 * 
 * Runtime configuration toggles per tenant. Values stored as JSON object.
 * Flag types: boolean (on/off), string (key), number (quota), json (complex config)
 * Status: enabled (active), disabled (inactive but preserved)
 */

export type FlagType = 'boolean' | 'string' | 'number' | 'json'

export type FlagStatus = 'enabled' | 'disabled'

export interface FeatureFlag {
  flag_id: string
  tenant_id: string
  name: string // e.g., "enable_advanced_reporting"
  flag_type: FlagType
  status: FlagStatus
  values: Record<string, unknown> // JSON object, e.g., { default: true, premium: false }
  created_at: string // ISO 8601 datetime
  updated_at: string // ISO 8601 datetime
}
