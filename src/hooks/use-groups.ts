'use client'

import { useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { SlotGroup, JoinGroupResult } from '@/lib/types'

export function useGroups(userId: string | undefined) {
  const [groups, setGroups] = useState<SlotGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  const fetchGroups = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      const { data: leaderGroups } = await supabase
        .from('groups')
        .select()
        .eq('leader_id', userId)

      const { data: memberRows } = await supabase
        .from('group_members')
        .select('group_id, groups(*)')
        .eq('user_id', userId)
        .eq('status', 'approved')

      const memberGroups = (memberRows ?? [])
        .map((r: Record<string, unknown>) => r.groups as SlotGroup | null)
        .filter((g): g is SlotGroup => g !== null)

      const seen = new Set<string>()
      const allGroups: SlotGroup[] = []
      for (const g of [...(leaderGroups ?? []), ...memberGroups]) {
        if (!seen.has(g.id)) {
          seen.add(g.id)
          allGroups.push(g)
        }
      }
      setGroups(allGroups)
    } catch {
      setError('グループの取得に失敗しました')
    }
    setIsLoading(false)
  }, [userId, supabase])

  const createGroup = useCallback(async (name: string) => {
    if (!userId) return
    const trimmed = name.trim()
    if (!trimmed) return
    setError(null)
    try {
      const { data: codeResult } = await supabase.rpc('generate_invite_code')
      const inviteCode = codeResult as string

      const { data: newGroup, error: err } = await supabase
        .from('groups')
        .insert({ name: trimmed, leader_id: userId, invite_code: inviteCode })
        .select()
        .single()
      if (err || !newGroup) throw err

      await supabase.from('group_members').insert({
        group_id: newGroup.id,
        user_id: userId,
        role: 'leader',
        status: 'approved',
      })

      setGroups(prev => [...prev, newGroup])
    } catch {
      setError('グループの作成に失敗しました')
    }
  }, [userId, supabase])

  const joinGroup = useCallback(async (inviteCode: string) => {
    setError(null)
    setSuccessMessage(null)
    try {
      const { data } = await supabase.rpc('join_group_by_code', { p_invite_code: inviteCode })
      const result = data as unknown as JoinGroupResult
      if (result.success) {
        setSuccessMessage(result.message ?? '参加申請を送信しました')
      } else {
        setError(result.error ?? '参加に失敗しました')
      }
    } catch {
      setError('参加申請に失敗しました')
    }
  }, [supabase])

  const deleteGroup = useCallback(async (groupId: string) => {
    setError(null)
    const { error: err } = await supabase.from('groups').delete().eq('id', groupId)
    if (err) {
      setError('グループの削除に失敗しました')
    } else {
      setGroups(prev => prev.filter(g => g.id !== groupId))
    }
  }, [supabase])

  return { groups, isLoading, error, successMessage, setError, setSuccessMessage, fetchGroups, createGroup, joinGroup, deleteGroup }
}
