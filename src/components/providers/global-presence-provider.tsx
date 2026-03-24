'use client'

import { createContext, useContext } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useGlobalPresence } from '@/hooks/use-global-presence'

interface GlobalPresenceContextValue {
  globalOnlineCount: number
}

const GlobalPresenceContext = createContext<GlobalPresenceContextValue>({ globalOnlineCount: 0 })

export function GlobalPresenceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { globalOnlineCount } = useGlobalPresence({ userId: user?.id })

  return (
    <GlobalPresenceContext.Provider value={{ globalOnlineCount }}>
      {children}
    </GlobalPresenceContext.Provider>
  )
}

export function useGlobalPresenceCount() {
  return useContext(GlobalPresenceContext)
}
