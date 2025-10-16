/**
 * Feature Flag Type Definitions (T022 - Part 2 of 5)
 * 
 * Runtime configuration toggles per tenant.
 * State: enabled (active), disabled (inactive but preserved)
 * Variant: Optional string value for A/B testing or deployment variants
 */

export type FlagState = 'enabled' | 'disabled'

export interface FeatureFlag {
  id: string // React-Admin requires this field for row keys
  flag_id: string
  key: string // e.g., "enable_advanced_reporting"
  state: FlagState // "enabled" or "disabled"
  variant?: string // Optional variant value (e.g., "v1", "v2")
  tenant_id: string
  created_at?: string // ISO 8601 datetime (optional in responses)
  updated_at?: string // ISO 8601 datetime (optional in responses)
}
