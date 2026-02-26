'use client'

import { useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Store } from '@/lib/types'

export function useStores(userId: string | undefined) {
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  const fetchStores = useCallback(async () => {
    if (!userId) return
    setIsLoading(stores.length === 0)
    setError(null)
    const { data, error: err } = await supabase
      .from('stores')
      .select()
      .eq('user_id', userId)
      .order('sort_order')
    if (err) {
      setError('店舗の取得に失敗しました')
    } else if (data) {
      setStores(data)
      setSelectedStore(prev => {
        if (!prev || !data.find(s => s.id === prev.id)) return data[0] ?? null
        return prev
      })
    }
    setIsLoading(false)
  }, [userId, supabase, stores.length])

  const addStore = useCallback(async (name: string) => {
    if (!userId) return
    const trimmed = name.trim()
    if (!trimmed) return
    if (stores.some(s => s.name === trimmed)) {
      setError('その店舗名は既に存在します')
      return
    }
    setError(null)
    const { data, error: err } = await supabase
      .from('stores')
      .insert({ user_id: userId, name: trimmed, sort_order: stores.length })
      .select()
      .single()
    if (err) {
      setError('店舗の追加に失敗しました')
    } else if (data) {
      setStores(prev => [...prev, data])
      setSelectedStore(data)
    }
  }, [userId, supabase, stores])

  const deleteStore = useCallback(async (store: Store) => {
    setError(null)
    const { error: err } = await supabase
      .from('stores')
      .delete()
      .eq('id', store.id)
    if (err) {
      setError('店舗の削除に失敗しました')
    } else {
      setStores(prev => prev.filter(s => s.id !== store.id))
      setSelectedStore(prev => prev?.id === store.id ? stores.find(s => s.id !== store.id) ?? null : prev)
    }
  }, [supabase, stores])

  return { stores, selectedStore, setSelectedStore, isLoading, error, fetchStores, addStore, deleteStore }
}
