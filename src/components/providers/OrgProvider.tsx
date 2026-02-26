'use client'

/**
 * V13: Organization Context Provider
 *
 * Client-side context for the active organization.
 * Hydrated from server-side resolution in the (app) layout.
 * Provides useOrg() hook for client components.
 */

import { createContext, useContext, useCallback, useTransition } from 'react'
import { switchOrganization } from '@/actions/org-actions'
import type { Organization, OrgRole } from '@/types/database'

export interface OrgContextValue {
  org: Organization
  role: OrgRole
  switchOrg: (orgId: string) => void
  isSwitching: boolean
}

const OrgContext = createContext<OrgContextValue | null>(null)

interface OrgProviderProps {
  org: Organization
  role: OrgRole
  children: React.ReactNode
}

export function OrgProvider({ org, role, children }: OrgProviderProps) {
  const [isSwitching, startTransition] = useTransition()

  const switchOrg = useCallback((orgId: string) => {
    startTransition(async () => {
      await switchOrganization(orgId)
      window.location.reload()
    })
  }, [startTransition])

  return (
    <OrgContext.Provider value={{ org, role, switchOrg, isSwitching }}>
      {children}
    </OrgContext.Provider>
  )
}

/**
 * Hook to access the active organization context.
 * Must be used within an OrgProvider.
 */
export function useOrg(): OrgContextValue {
  const context = useContext(OrgContext)
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider')
  }
  return context
}
