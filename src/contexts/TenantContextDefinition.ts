/**
 * Tenant Context Definition
 * 
 * Separate context definition for better Fast Refresh compatibility
 */
import { createContext } from 'react'

export interface TenantContextValue {
  selectedTenantId: string | null
  setSelectedTenantId: (tenantId: string | null) => void
}

export const TenantContext = createContext<TenantContextValue | undefined>(undefined)