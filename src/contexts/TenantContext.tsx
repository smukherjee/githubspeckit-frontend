/**
 * Tenant Context for Superadmin Tenant Switching
 *
 * Provides tenant selection state for superadmin users:
 * - selectedTenantId: Currently selected tenant for data filtering
 * - setSelectedTenantId: Function to change selected tenant
 * - Persists selection to localStorage across sessions
 * - Initial value: User's own tenant_id from JWT
 */

import {
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { getUser } from '@/utils/storage'
import { TenantContext, type TenantContextValue } from './TenantContextDefinition'

const STORAGE_KEY = 'selected_tenant_id'

interface TenantProviderProps {
  children: ReactNode
}

/**
 * TenantProvider component
 * Wraps the application to provide tenant selection state
 */
export function TenantProvider({ children }: TenantProviderProps) {
  // Initialize from localStorage or user's tenant_id
  const [selectedTenantId, setSelectedTenantIdState] = useState<string | null>(
    () => {
      // Try to restore from localStorage
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return saved
      }

      // Fallback to user's own tenant_id
      const user = getUser()
      return user?.tenant_id || null
    }
  )

  // Persist to localStorage when selectedTenantId changes
  useEffect(() => {
    if (selectedTenantId) {
      localStorage.setItem(STORAGE_KEY, selectedTenantId)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [selectedTenantId])

  const setSelectedTenantId = (tenantId: string | null) => {
    setSelectedTenantIdState(tenantId)
    // Force a page refresh to reload all data with the new tenant
    // This ensures all components and caches are properly updated
    setTimeout(() => {
      window.location.reload()
    }, 100) // Small delay to allow state to save to localStorage
  }

  const value: TenantContextValue = {
    selectedTenantId,
    setSelectedTenantId,
  }

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  )
}
