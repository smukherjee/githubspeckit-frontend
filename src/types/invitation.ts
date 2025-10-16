/**
 * Invitation Type Definitions (T022 - Part 4 of 5)
 * 
 * User invitation workflow entity. Invitations are immutable after creation.
 * Status: pending (awaiting acceptance), accepted (completed), expired (timeout), revoked (canceled)
 * Roles: assigned roles for the invited user upon acceptance
 */

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

export interface Invitation {
  invitation_id: string
  tenant_id: string
  email: string // Invited user email
  roles: string[] // User roles to assign on acceptance (e.g., ["standard"])
  status: InvitationStatus
  expires_at: string // ISO 8601 datetime
  created_at: string // ISO 8601 datetime
}
