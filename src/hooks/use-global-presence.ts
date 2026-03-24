'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const HEARTBEAT_INTERVAL = 3 * 60 * 1000 // 3 minutes
const POLL_INTERVAL = 60 * 1000 // 1 minute

interface UseGlobalPresenceProps {
  userId: string | undefined
}

export function useGlobalPresence({ userId }: UseGlobalPresenceProps) {
  const [globalOnlineCount, setGlobalOnlineCount] = useState(0)
  const supabase = getSupabaseBrowserClient()
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const heartbeat = useCallback(async () => {
    if (!userId) return
    await supabase
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId)
  }, [userId, supabase])

  const fetchCount = useCallback(async () => {
    const { data } = await supabase.rpc('get_active_user_count')
    if (typeof data === 'number') {
      setGlobalOnlineCount(data)
    }
  }, [supabase])

  useEffect(() => {
    if (!userId) return

    // Initial heartbeat + fetch
    heartbeat()
    fetchCount()

    // Periodic heartbeat (every 3 min)
    heartbeatRef.current = setInterval(heartbeat, HEARTBEAT_INTERVAL)

    // Periodic count poll (every 1 min)
    pollRef.current = setInterval(fetchCount, POLL_INTERVAL)

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      if (pollRef.current) clearInterval(pollRef.current)
      setGlobalOnlineCount(0)
    }
  }, [userId, heartbeat, fetchCount])

  return { globalOnlineCount }
}
