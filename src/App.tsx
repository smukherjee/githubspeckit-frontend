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

import { Admin, Resource, defaultTheme, CustomRoutes } from 'react-admin'
import { useMemo } from 'react'
import { Route } from 'react-router-dom'
import { authProvider } from '@/providers/authProvider'
import { createDataProvider } from '@/providers/dataProvider'
import { TenantProvider } from '@/contexts/TenantContext'
import { useTenant } from '@/hooks/useTenant'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { Layout } from '@/components/layout/Layout'
import { ForbiddenPage } from '@/components/layout/ForbiddenPage'

// Resource components
import { UserList, UserCreate, UserEdit, UserShow, UserProfile } from '@/resources/users'
import {
  TenantList,
  TenantCreate,
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
  InvitationShow,
} from '@/resources/invitations'
import { AuditEventList, AuditEventShow } from '@/resources/auditEvents'
import { HealthStatus, ConfigViewer, LogsViewer, MetricsViewer } from '@/resources/system'

// Material-UI icons for resources
import PeopleIcon from '@mui/icons-material/People'
import BusinessIcon from '@mui/icons-material/Business'
import FlagIcon from '@mui/icons-material/Flag'
import PolicyIcon from '@mui/icons-material/Policy'
import MailIcon from '@mui/icons-material/Mail'
import HistoryIcon from '@mui/icons-material/History'
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart'
import SettingsIcon from '@mui/icons-material/Settings'
import DescriptionIcon from '@mui/icons-material/Description'
import BarChartIcon from '@mui/icons-material/BarChart'

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

// Inner component that has access to TenantContext
function AdminApp() {
  const { selectedTenantId } = useTenant()
  
  // Recreate dataProvider when selectedTenantId changes
  const dataProvider = useMemo(
    () => createDataProvider(selectedTenantId),
    [selectedTenantId]
  )

  return (
    <Admin
      authProvider={authProvider}
      dataProvider={dataProvider}
      theme={theme}
      layout={Layout}
      catchAll={ForbiddenPage}
      requireAuth
    >
      {/* T049: User Resource */}
      <Resource
        name="users"
        list={UserList}
        create={UserCreate}
        edit={UserEdit}
        show={UserShow}
        icon={PeopleIcon}
      />
      {/* T049: Tenant Resource (Superadmin Only) */}
      {/* Note: Only list and create are supported by backend */}
      <Resource
        name="tenants"
        list={TenantList}
        create={TenantCreate}
        icon={BusinessIcon}
      />
      {/* T049: Feature Flags Resource */}
      <Resource
        name="feature-flags"
        list={FeatureFlagList}
        create={FeatureFlagCreate}
        edit={FeatureFlagEdit}
        show={FeatureFlagShow}
        icon={FlagIcon}
        options={{ label: 'Feature Flags' }}
      />
      {/* T049: Policies Resource */}
      <Resource
        name="policies"
        list={PolicyList}
        create={PolicyCreate}
        edit={PolicyEdit}
        show={PolicyShow}
        icon={PolicyIcon}
      />
      {/* T049: Invitations Resource */}
      <Resource
        name="invitations"
        list={InvitationList}
        show={InvitationShow}
        icon={MailIcon}
      />
      {/* T049: Audit Events Resource (Read-Only) */}
      <Resource
        name="audit-events"
        list={AuditEventList}
        show={AuditEventShow}
        icon={HistoryIcon}
        options={{ label: 'Audit Events' }}
      />
      
      {/* System Monitoring (Superadmin Only) */}
      <Resource
        name="system-health"
        list={HealthStatus}
        icon={MonitorHeartIcon}
        options={{ label: 'System Health' }}
      />
      <Resource
        name="system-config"
        list={ConfigViewer}
        icon={SettingsIcon}
        options={{ label: 'Configuration' }}
      />
      <Resource
        name="system-logs"
        list={LogsViewer}
        icon={DescriptionIcon}
        options={{ label: 'Logs' }}
      />
      <Resource
        name="system-metrics"
        list={MetricsViewer}
        icon={BarChartIcon}
        options={{ label: 'Metrics' }}
      />
      
      {/* Custom Routes */}
      <CustomRoutes>
        <Route path="/users/:id/profile" element={<UserProfile />} />
      </CustomRoutes>
    </Admin>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <TenantProvider>
        <AdminApp />
      </TenantProvider>
    </ErrorBoundary>
  )
}

export default App
