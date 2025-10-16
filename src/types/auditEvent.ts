/**
 * Audit Event Type Definitions (T022 - Part 5 of 5)
 * 
 * Immutable audit log entries for compliance and forensics.
 * Read-only resource (no create/update/delete from frontend).
 * Contains 12 fields: id, event_id, action, category, actor_user_id, actor_id, 
 * resource_type, resource_id, target, metadata, timestamp, tenant_id
 */

export interface AuditEvent {
  id: string // React-Admin requires this field for row keys
  event_id: string
  action: string // e.g., "user_created", "user_updated", "token_revoke"
  category: string // e.g., "USER_MANAGEMENT", "TOKEN", "POLICY_MANAGEMENT"
  actor_user_id: string | null // User ID of who performed the action
  actor_id: string | null // Actor identifier (can be user or system)
  resource_type: string // e.g., "user", "policy", "tenant"
  resource_id: string | null // ID of affected resource (null for global actions)
  target: string | null // Target of the action (e.g., email address, policy name)
  metadata: Record<string, unknown> // JSON object with event-specific details (e.g., { ip_address: "192.168.1.1", changes: [...] })
  timestamp: string // ISO 8601 datetime
  tenant_id: string
}
