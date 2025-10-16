/**
 * Custom Layout Component
 *
 * Wraps react-admin Layout with:
 * - Custom AppBar (includes TenantSwitcher)
 * - Responsive menu (collapsed on tablet)
 */

import { Layout as RaLayout } from 'react-admin'
import { AppBar } from './AppBar'

export function Layout(props: Parameters<typeof RaLayout>[0]) {
  return <RaLayout {...props} appBar={AppBar} />
}
