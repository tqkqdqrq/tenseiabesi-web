'use client'

import { useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { GroupTag } from '@/lib/types'

export function useGroupTags() {
  const [tags, setTags] = useState<GroupTag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  const fetchTags = useCallback(async (groupId: string) => {
    setIsLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('group_tags')
      .select('*')
      .eq('group_id', groupId)
      .order('sort_order')
    if (err) {
      setError('タグの取得に失敗しました')
    } else {
      setTags(data ?? [])
    }
    setIsLoading(false)
  }, [supabase])

  const addTag = useCallback(async (groupId: string, label: string, color: string) => {
    setError(null)
    const trimmed = label.trim()
    if (!trimmed) return
    if (tags.some(t => t.label === trimmed)) {
      setError('同じ名前のタグが既にあります')
      return
    }
    const { data, error: err } = await supabase
      .from('group_tags')
      .insert({ group_id: groupId, label: trimmed, color, sort_order: tags.length })
      .select()
      .single()
    if (err) {
      setError('タグの追加に失敗しました')
    } else if (data) {
      setTags(prev => [...prev, data as GroupTag])
    }
  }, [supabase, tags])

  const deleteTag = useCallback(async (tagId: string) => {
    setError(null)
    const { error: err } = await supabase
      .from('group_tags')
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
