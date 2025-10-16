/**
 * Policy Type Definitions (T022 - Part 3 of 5)
 * 
 * RBAC policy engine rules for resource-level authorization.
 * Effects: Allow (grant), Deny (explicit block)
 * Condition Expression: String representation of policy rules (evaluated by backend)
 * Version: Policy version number for tracking changes
 */

export type PolicyEffect = 'Allow' | 'Deny'

export interface Policy {
  id: string // React-Admin requires this field for row keys
  policy_id: string
  version: number // Policy version for tracking updates
  resource_type: string // e.g., "users", "tenants", "policies"
  condition_expression: string // String representation of conditions (e.g., "user.role == 'admin'")
  effect: PolicyEffect // "Allow" or "Deny"
  created_by?: string // User who created the policy (optional)
  created_at?: string // ISO 8601 datetime (optional in responses)
  updated_at?: string // ISO 8601 datetime (optional in responses)
}
