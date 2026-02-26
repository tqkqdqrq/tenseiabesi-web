'use client'

import { useEffect, useState, useRef } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { PresenceUser } from '@/lib/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UsePresenceProps {
  groupId: string | null
  userId: string | undefined
  displayName: string | undefined
}

export function usePresence({ groupId, userId, displayName }: UsePresenceProps) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!groupId || !userId || !displayName) return

    const channel = supabase.channel(`presence-group-${groupId}`)
    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser>()
        const users: PresenceUser[] = []
        const seen = new Set<string>()
        for (const key in state) {
          for (const presence of state[key]) {
            if (!seen.has(presence.user_id)) {
              seen.add(presence.user_id)
              users.push(presence)
            }
          }
        }
        setOnlineUsers(users)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            display_name: displayName,
            joined_at: Date.now(),
          })
        }
      })

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
      channelRef.current = null
      setOnlineUsers([])
    }
  }, [groupId, userId, displayName, supabase])

  return { onlineUsers }
}
