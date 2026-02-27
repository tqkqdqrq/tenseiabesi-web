'use client'

import { useState, useCallback, useRef } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Store } from '@/lib/types'

export function useStores(userId: string | undefined) {
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()
  const storesRef = useRef(stores)
  storesRef.current = stores

  const fetchStores = useCallback(async () => {
    console.log('[fetchStores] called, userId:', userId)
    if (!userId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    console.log('[fetchStores] loading started')
    setError(null)
    try {
      console.log('[fetchStores] calling supabase...')
      const { data, error: err } = await supabase
        .from('stores')
        .select()
        .eq('user_id', userId)
        .order('sort_order')
      if (err) {
        console.log('[fetchStores] error:', err)
        setError('店舗の取得に失敗しました')
      } else if (data) {
        console.log('[fetchStores] data received:', data.length, 'stores')
        setStores(data)
        setSelectedStore(prev => {
          if (!prev || !data.find(s => s.id === prev.id)) return data[0] ?? null
          return prev
        })
      }
    } finally {
      console.log('[fetchStores] finally, setting isLoading false')
      setIsLoading(false)
    }
  }, [userId, supabase])

  const addStore = useCallback(async (name: string) => {
    if (!userId) return
    const trimmed = name.trim()
    if (!trimmed) return
    if (storesRef.current.some(s => s.name === trimmed)) {
      setError('その店舗名は既に存在します')
      return
    }
    setError(null)
    const { data, error: err } = await supabase
      .from('stores')
      .insert({ user_id: userId, name: trimmed, sort_order: storesRef.current.length })
      .select()
      .single()
    if (err) {
      setError('店舗の追加に失敗しました')
    } else if (data) {
      setStores(prev => [...prev, data])
      setSelectedStore(data)
    }
  }, [userId, supabase])

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
      setSelectedStore(prev => prev?.id === store.id ? storesRef.current.find(s => s.id !== store.id) ?? null : prev)
    }
  }, [supabase])

  return { stores, selectedStore, setSelectedStore, isLoading, error, fetchStores, addStore, deleteStore }
}
