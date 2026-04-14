'use client'

import { useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { UserTag } from '@/lib/types'

export function useUserTags() {
  const [tags, setTags] = useState<UserTag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  const fetchTags = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) {
      setIsLoading(false)
      return
    }
    const { data, error: err } = await supabase
      .from('user_tags')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order')
    if (err) {
      setError('タグの取得に失敗しました')
    } else {
      setTags(data ?? [])
    }
    setIsLoading(false)
  }, [supabase])

  const addTag = useCallback(async (label: string, color: string) => {
    setError(null)
    const trimmed = label.trim()
    if (!trimmed) return
    if (tags.some(t => t.label === trimmed)) {
      setError('同じ名前のタグが既にあります')
      return
    }
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return
    const { data, error: err } = await supabase
      .from('user_tags')
      .insert({ user_id: userId, label: trimmed, color, sort_order: tags.length })
      .select()
      .single()
    if (err) {
      setError('タグの追加に失敗しました')
    } else if (data) {
      setTags(prev => [...prev, data as UserTag])
    }
  }, [supabase, tags])

  const deleteTag = useCallback(async (tagId: string) => {
    setError(null)
    const { error: err } = await supabase
      .from('user_tags')
      .delete()
      .eq('id', tagId)
    if (err) {
      setError('タグの削除に失敗しました')
    } else {
      setTags(prev => prev.filter(t => t.id !== tagId))
    }
  }, [supabase])

  return { tags, isLoading, error, fetchTags, addTag, deleteTag }
}
