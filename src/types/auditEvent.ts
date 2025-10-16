/**
 * Audit Event Type Definitions (T022 - Part 5 of 5)
 * 
 * Immutable audit log entries for compliance and forensics.
 * Read-only resource (no create/update/delete from frontend).
 * Metadata: JSON object with event-specific details (e.g., { ip_address: "192.168.1.1", user_agent: "..." })
 */

export interface AuditEvent {
  event_id: string
  tenant_id: string
  actor_id: string // User who performed the action
  action: string // e.g., "user.created", "user.updated", "user.deleted"
  resource_type: string // e.g., "users", "tenants"
  resource_id: string | null // ID of affected resource (null for global actions)
  timestamp: string // ISO 8601 datetime
  metadata: Record<string, unknown> // JSON object with event context
}
