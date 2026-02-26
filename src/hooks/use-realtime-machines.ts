'use client'

import { useEffect, useRef } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { MachineChange, MachineChangeType, GroupMachineWithProfiles } from '@/lib/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeMachinesProps {
  groupId: string | null
  selectedStoreId: string | null
  userId: string | undefined
  onRefetch: (storeId: string) => Promise<void>
  addHighlight: (machineId: string, info: { changer_name: string; change_type: MachineChangeType }) => void
}

export function useRealtimeMachines({
  groupId,
  selectedStoreId,
  userId,
  onRefetch,
  addHighlight,
}: UseRealtimeMachinesProps) {
  const pgChannelRef = useRef<RealtimeChannel | null>(null)
  const supabase = getSupabaseBrowserClient()

  // Postgres Changes for INSERT/DELETE detection
  useEffect(() => {
    if (!groupId) return

    const channel = supabase
      .channel(`pg-group_machines-${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_machines', filter: `group_id=eq.${groupId}` },
        () => {
          if (selectedStoreId) onRefetch(selectedStoreId)
        }
      )
      .subscribe()

    pgChannelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      pgChannelRef.current = null
    }
  }, [groupId, selectedStoreId, supabase, onRefetch])

  return null
}

// Broadcast channel hook - separate for lifecycle management
export function useBroadcastChannel(groupId: string | null) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!groupId) return

    const channel = supabase.channel(`group-${groupId}`)
    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [groupId, supabase])

  return channelRef
}
