'use client'

import { useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { GroupMemberWithProfile } from '@/lib/types'

export function useGroupMembers() {
  const [members, setMembers] = useState<GroupMemberWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  const fetchMembers = useCallback(async (groupId: string) => {
    setIsLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('group_members')
      .select('*, profile:profiles(*)')
      .eq('group_id', groupId)
    if (err) {
      setError('メンバーの取得に失敗しました')
    } else if (data) {
      setMembers(data as GroupMemberWithProfile[])
    }
    setIsLoading(false)
  }, [supabase])

  const approveMember = useCallback(async (memberId: string) => {
    setError(null)
    const { error: err } = await supabase
      .from('group_members')
      .update({ status: 'approved' })
      .eq('id', memberId)
    if (err) {
      setError('承認に失敗しました')
    } else {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: 'approved' } : m))
    }
  }, [supabase])

  const rejectMember = useCallback(async (memberId: string) => {
    setError(null)
    const { error: err } = await supabase
      .from('group_members')
      .update({ status: 'rejected' })
      .eq('id', memberId)
    if (err) {
      setError('拒否に失敗しました')
    } else {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: 'rejected' } : m))
    }
  }, [supabase])

  const removeMember = useCallback(async (memberId: string) => {
    setError(null)
    const { error: err } = await supabase
      .from('group_members')
      .delete()
      .eq('id', memberId)
    if (err) {
      setError('メンバーの削除に失敗しました')
    } else {
      setMembers(prev => prev.filter(m => m.id !== memberId))
    }
  }, [supabase])

  return { members, isLoading, error, fetchMembers, approveMember, rejectMember, removeMember }
}
