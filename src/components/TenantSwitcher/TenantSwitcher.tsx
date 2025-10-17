/**
 * TenantSwitcher Component
 *
 * Dropdown selector for superadmin users to switch between tenants:
 * - Fetches tenant list from GET /api/v1/tenants
 * - Displays Material-UI Select with tenant names
 * - Updates selectedTenantId in TenantContext on change
 * - Only renders if user role is 'superadmin'
 * - Responsive: Width adjusts based on viewport (150px tablet, 200px desktop)
 */

import { useEffect, useState } from 'react'
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme,
  type SelectChangeEvent,
} from '@mui/material'
import { usePermissions } from 'react-admin'
import { useTenant } from '@/contexts/TenantContext'
import { apiClient } from '@/utils/api'
import type { Tenant } from '@/types/tenant'

export function TenantSwitcher() {
  const { permissions } = usePermissions()
  const { selectedTenantId, setSelectedTenantId } = useTenant()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))

  // Only render for superadmin users
  const isSuperadmin = permissions?.includes('superadmin')

  // Fetch tenant list on mount
  useEffect(() => {
    if (!isSuperadmin) {
      return
    }

    const fetchTenants = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/tenants')
        
        // Backend may return {tenants: [...]} or just [...]
        let tenantsList: Tenant[] = []
        if (Array.isArray(response.data)) {
          tenantsList = response.data
        } else if (response.data?.tenants && Array.isArray(response.data.tenants)) {
          tenantsList = response.data.tenants
        }
        
        setTenants(tenantsList)
        
        // Update selected tenant if it no longer exists
        if (selectedTenantId && !tenantsList.some(t => t.tenant_id === selectedTenantId)) {
          setSelectedTenantId(tenantsList[0]?.tenant_id ?? '')
        }
      } catch (error) {
        console.error('Failed to fetch tenants:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTenants()
  }, [isSuperadmin, selectedTenantId, setSelectedTenantId])

  // Handle tenant selection change
  const handleChange = (event: SelectChangeEvent<string>) => {
    const newTenantId = event.target.value
    setSelectedTenantId(newTenantId)
  }

  // Don't render if not superadmin
  if (!isSuperadmin) {
    return null
  }

  // Responsive width: 150px on tablet, 200px on desktop
  const width = isTablet ? 150 : 200

  // Handle empty tenants gracefully
  const options = tenants ?? []
  if (!options.length) {
    return (
      <FormControl size="small" sx={{ minWidth: width, mr: 2 }}>
        <InputLabel id="tenant-select-label">Tenant</InputLabel>
        <Select
          labelId="tenant-select-label"
          id="tenant-select"
          value=""
          label="Tenant"
          disabled
        >
          <MenuItem value="">
            <em>No tenants available</em>
          </MenuItem>
        </Select>
      </FormControl>
    )
  }

  return (
    <FormControl size="small" sx={{ minWidth: width, mr: 2 }}>
      <InputLabel id="tenant-select-label">Tenant</InputLabel>
      <Select
        labelId="tenant-select-label"
        id="tenant-select"
        value={selectedTenantId || ''}
        label="Tenant"
        onChange={handleChange}
        disabled={loading || !options || options.length === 0}
      >
        {options.map((tenant) => (
          <MenuItem key={tenant.tenant_id} value={tenant.tenant_id}>
            {tenant.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
