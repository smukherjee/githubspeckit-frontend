/**
 * Policy Type Definitions (T022 - Part 3 of 5)
 * 
 * RBAC policy engine rules for resource-level authorization.
 * Effects: ALLOW (grant), DENY (explicit block), ABSTAIN (no opinion)
 * Conditions: JSON object with policy evaluation rules (e.g., { ip_range: "10.0.0.0/8" })
 */

export type PolicyEffect = 'ALLOW' | 'DENY' | 'ABSTAIN'

export interface Policy {
  policy_id: string
  tenant_id: string
  resource_type: string // e.g., "users", "tenants", "policies"
  action: string // e.g., "read", "create", "update", "delete"
  effect: PolicyEffect
  conditions: Record<string, unknown> // JSON object for policy rules
  created_at: string // ISO 8601 datetime
  updated_at: string // ISO 8601 datetime
}
