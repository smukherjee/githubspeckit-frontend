/**
 * useTenant hook
 * Access tenant selection state from any component
 *
 * @throws Error if used outside TenantProvider
 * @returns TenantContextValue
 */
import { useContext } from 'react'
import { TenantContext, type TenantContextValue } from '@/contexts/TenantContextDefinition'

export const useTenant = (): TenantContextValue => {
  const context = useContext(TenantContext)

  if (context === undefined) {
    throw new Error('useTenant must be used within TenantProvider')
  }

  return context
}