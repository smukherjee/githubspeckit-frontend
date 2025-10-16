/**
 * Main App Component (T048, T053)
 *
 * React-Admin application with:
 * - RBAC permission enforcement
 * - 6 resources (users, tenants, feature-flags, policies, invitations, audit-events)
 * - TenantContext for superadmin tenant switching
 * - ErrorBoundary for global error handling
 * - Custom layout with TenantSwitcher
 * - Responsive Material-UI theme
 */

import { Admin, Resource, defaultTheme } from 'react-admin'
import { authProvider } from '@/providers/authProvider'
import { dataProvider } from '@/providers/dataProvider'
import { TenantProvider } from '@/contexts/TenantContext'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { Layout } from '@/components/layout/Layout'
import { ForbiddenPage } from '@/components/layout/ForbiddenPage'

// Resource components
import { UserList, UserCreate, UserEdit, UserShow } from '@/resources/users'
import {
  TenantList,
  TenantCreate,
  TenantEdit,
  TenantShow,
} from '@/resources/tenants'
import {
  FeatureFlagList,
  FeatureFlagCreate,
  FeatureFlagEdit,
  FeatureFlagShow,
} from '@/resources/featureFlags'
import {
  PolicyList,
  PolicyCreate,
  PolicyEdit,
  PolicyShow,
} from '@/resources/policies'
import {
  InvitationList,
  InvitationCreate,
  InvitationShow,
} from '@/resources/invitations'
import { AuditEventList, AuditEventShow } from '@/resources/auditEvents'

// Material-UI icons for resources
import PeopleIcon from '@mui/icons-material/People'
import BusinessIcon from '@mui/icons-material/Business'
import FlagIcon from '@mui/icons-material/Flag'
import PolicyIcon from '@mui/icons-material/Policy'
import MailIcon from '@mui/icons-material/Mail'
import HistoryIcon from '@mui/icons-material/History'

// T050: Configure Material-UI theme with responsive breakpoints
const theme = {
  ...defaultTheme,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  spacing: 8,
  components: {
    ...defaultTheme.components,
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          minWidth: 44,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          minWidth: 44,
        },
      },
    },
  },
}

function App() {
  return (
    <ErrorBoundary>
      <TenantProvider>
        <Admin
          authProvider={authProvider}
          dataProvider={dataProvider}
          theme={theme}
          layout={Layout}
          catchAll={ForbiddenPage}
          requireAuth
        >
          <Resource
            name="users"
            list={UserList}
            create={UserCreate}
            edit={UserEdit}
            show={UserShow}
            icon={PeopleIcon}
          />
          <Resource
            name="tenants"
            list={TenantList}
            create={TenantCreate}
            edit={TenantEdit}
            show={TenantShow}
            icon={BusinessIcon}
            options={{ label: 'Tenants' }}
          />
          <Resource
            name="feature-flags"
            list={FeatureFlagList}
            create={FeatureFlagCreate}
            edit={FeatureFlagEdit}
            show={FeatureFlagShow}
            icon={FlagIcon}
            options={{ label: 'Feature Flags' }}
          />
          <Resource
            name="policies"
            list={PolicyList}
            create={PolicyCreate}
            edit={PolicyEdit}
            show={PolicyShow}
            icon={PolicyIcon}
          />
          <Resource
            name="invitations"
            list={InvitationList}
            create={InvitationCreate}
            show={InvitationShow}
            icon={MailIcon}
          />
          <Resource
            name="audit-events"
            list={AuditEventList}
            show={AuditEventShow}
            icon={HistoryIcon}
            options={{ label: 'Audit Events' }}
          />
        </Admin>
      </TenantProvider>
    </ErrorBoundary>
  )
}

export default App
