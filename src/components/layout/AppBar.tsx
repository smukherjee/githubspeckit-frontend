/**
 * Custom AppBar Component
 *
 * Extends react-admin AppBar with TenantSwitcher:
 * - Shows TenantSwitcher dropdown (right side, before user menu)
 * - Only visible for superadmin users
 * - Preserves default react-admin AppBar functionality
 */

import { AppBar as RaAppBar } from 'react-admin'
import { Box } from '@mui/material'
import { TenantSwitcher } from '@/components/TenantSwitcher/TenantSwitcher'

export function AppBar() {
  return (
    <RaAppBar>
      <Box flex="1" />
      <TenantSwitcher />
    </RaAppBar>
  )
}
