'use client'

import { useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { GroupStore, GroupMachineWithProfiles, MachineStatus, MachineChange, MachineChangeType, HighlightInfo, Profile } from '@/lib/types'

export function useGroupData(userId: string | undefined) {
  const [stores, setStores] = useState<GroupStore[]>([])
  const [selectedStore, setSelectedStore] = useState<GroupStore | null>(null)
  const [machines, setMachines] = useState<GroupMachineWithProfiles[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlightedMachines, setHighlightedMachines] = useState<Map<string, HighlightInfo>>(new Map())
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const supabase = getSupabaseBrowserClient()

  const loadCurrentProfile = useCallback(async () => {
    if (!userId) return null
    const { data } = await supabase.from('profiles').select().eq('id', userId).single()
    if (data) setCurrentProfile(data)
    return data
  }, [userId, supabase])

  const fetchStores = useCallback(async (groupId: string) => {
    setIsLoading(stores.length === 0)
    setError(null)
    const { data, error: err } = await supabase
      .from('group_stores')
      .select()
      .eq('group_id', groupId)
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
  }, [supabase, stores.length])

  const addStore = useCallback(async (groupId: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (stores.some(s => s.name === trimmed)) {
      setError('その店舗名は既に存在します')
      return
    }
    setError(null)
    const { data, error: err } = await supabase
      .from('group_stores')
      .insert({ group_id: groupId, name: trimmed, sort_order: stores.length })
      .select()
      .single()
    if (err) {
      setError('店舗の追加に失敗しました')
    } else if (data) {
      setStores(prev => [...prev, data])
      setSelectedStore(data)
    }
  }, [supabase, stores])

  const deleteStore = useCallback(async (store: GroupStore) => {
    setError(null)
    const { error: err } = await supabase.from('group_stores').delete().eq('id', store.id)
    if (err) {
      setError('店舗の削除に失敗しました')
    } else {
      setStores(prev => prev.filter(s => s.id !== store.id))
      setSelectedStore(prev => prev?.id === store.id ? stores.find(s => s.id !== store.id) ?? null : prev)
    }
  }, [supabase, stores])

  const fetchMachines = useCallback(async (groupStoreId: string) => {
    setIsLoading(machines.length === 0)
    setError(null)
    const { data, error: err } = await supabase
      .from('group_machines')
      .select('*, contributor:profiles!group_machines_contributor_id_fkey(*), last_updater:profiles!group_machines_last_updated_by_fkey(*)')
      .eq('group_store_id', groupStoreId)
      .order('sort_order')
    if (err) {
      setError('台データの取得に失敗しました')
    } else if (data) {
      setMachines(data as GroupMachineWithProfiles[])
    }
    setIsLoading(false)
  }, [supabase, machines.length])

  const addMachine = useCallback(async (groupStoreId: string, groupId: string, number: string): Promise<string | null> => {
    if (!userId) return null
    const trimmed = number.trim()
    if (!trimmed) return null
    setError(null)
    const { data, error: err } = await supabase
      .from('group_machines')
      .insert({
        group_store_id: groupStoreId,
        group_id: groupId,
        contributor_id: userId,
        number: trimmed,
        sort_order: machines.length,
      })
      .select('*, contributor:profiles!group_machines_contributor_id_fkey(*), last_updater:profiles!group_machines_last_updated_by_fkey(*)')
      .single()
    if (err) {
      setError('台の追加に失敗しました')
      return null
    }
    if (data) {
      setMachines(prev => [...prev, data as GroupMachineWithProfiles])
      return data.id
    }
    return null
  }, [userId, supabase, machines.length])

  const updateStatus = useCallback(async (machineId: string, newStatus: MachineStatus) => {
    if (!userId) return
    setError(null)
    const { error: err } = await supabase
      .from('group_machines')
      .update({ status: newStatus, last_updated_by: userId })
      .eq('id', machineId)
    if (err) {
      setError('状態の更新に失敗しました')
    } else {
      setMachines(prev => prev.map(m => m.id === machineId ? { ...m, status: newStatus, last_updated_by: userId } : m))
    }
    return machineId
  }, [userId, supabase])

  const updateFirstHitCount = useCallback(async (machineId: string, count: number) => {
    if (!userId) return
    setError(null)
    const { error: err } = await supabase
      .from('group_machines')
      .update({ first_hit_count: count, last_updated_by: userId })
      .eq('id', machineId)
    if (err) {
      setError('初当り回数の更新に失敗しました')
    } else {
      setMachines(prev => prev.map(m => m.id === machineId ? { ...m, first_hit_count: count, last_updated_by: userId } : m))
    }
    return machineId
  }, [userId, supabase])

  const updateMemo = useCallback(async (machineId: string, memo: string) => {
    if (!userId) return
    setError(null)
    const { error: err } = await supabase
      .from('group_machines')
      .update({ memo, last_updated_by: userId })
      .eq('id', machineId)
    if (err) {
      setError('メモの更新に失敗しました')
    } else {
      setMachines(prev => prev.map(m => m.id === machineId ? { ...m, memo, last_updated_by: userId } : m))
    }
    return machineId
  }, [userId, supabase])

  const deleteMachine = useCallback(async (machineId: string) => {
    setError(null)
    const { error: err } = await supabase.from('group_machines').delete().eq('id', machineId)
    if (err) {
      setError('台の削除に失敗しました')
    } else {
      setMachines(prev => prev.filter(m => m.id !== machineId))
    }
    return machineId
  }, [supabase])

  const resetMachines = useCallback(async (groupStoreId: string) => {
    setError(null)
    const { error: err } = await supabase.rpc('reset_group_store_machines', { p_group_store_id: groupStoreId })
    if (err) {
      setError('リセットに失敗しました')
    } else {
      setMachines(prev => prev.map(m => ({ ...m, status: '未確認', first_hit_count: 0, memo: '' })))
    }
  }, [supabase])

  const moveMachine = useCallback(async (oldIndex: number, newIndex: number) => {
    setError(null)
    const updated = [...machines]
    const [moved] = updated.splice(oldIndex, 1)
    updated.splice(newIndex, 0, moved)
    const reordered = updated.map((m, i) => ({ ...m, sort_order: i }))
    setMachines(reordered)
    for (const m of reordered) {
      await supabase.from('group_machines').update({ sort_order: m.sort_order }).eq('id', m.id)
    }
  }, [supabase, machines])

  // Broadcast helper
  const notifyChange = useCallback(async (
    channel: ReturnType<ReturnType<typeof getSupabaseBrowserClient>['channel']>,
    machineId?: string,
    changeType?: MachineChangeType
  ) => {
    if (machineId && changeType && userId && currentProfile && selectedStore) {
      const payload: MachineChange = {
        machine_id: machineId,
        change_type: changeType,
        changer_user_id: userId,
        changer_name: currentProfile.display_name,
        store_id: selectedStore.id,
      }
      await channel.send({ type: 'broadcast', event: 'machines_changed', payload })
    } else {
      await channel.send({ type: 'broadcast', event: 'machines_changed', payload: {} })
    }
  }, [userId, currentProfile, selectedStore])

  const addHighlight = useCallback((machineId: string, info: HighlightInfo) => {
    setHighlightedMachines(prev => new Map(prev).set(machineId, info))
    setTimeout(() => {
      setHighlightedMachines(prev => {
        const next = new Map(prev)
        next.delete(machineId)
        return next
      })
    }, 3000)
  }, [])

  return {
    stores, selectedStore, setSelectedStore,
    machines, isLoading, error,
    highlightedMachines, currentProfile,
    loadCurrentProfile,
    fetchStores, addStore, deleteStore,
    fetchMachines, addMachine, updateStatus, updateFirstHitCount,
    updateMemo, deleteMachine, resetMachines, moveMachine,
    notifyChange, addHighlight, setMachines,
  }
}
