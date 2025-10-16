/**
 * MSW Request Handlers Index
 * 
 * Aggregates all API endpoint mocks for MSW server.
 * Handlers are organized by resource (auth, users, tenants, etc.)
 */

import { authHandlers } from './handlers/auth'
import { usersHandlers } from './handlers/users'
import { tenantsHandlers } from './handlers/tenants'
import { featureFlagsHandlers } from './handlers/featureFlags'
import { policiesHandlers } from './handlers/policies'
import { invitationsHandlers } from './handlers/invitations'
import { auditEventsHandlers } from './handlers/auditEvents'

export const handlers = [
  ...authHandlers,
  ...usersHandlers,
  ...tenantsHandlers,
  ...featureFlagsHandlers,
  ...policiesHandlers,
  ...invitationsHandlers,
  ...auditEventsHandlers,
]
