'use client'

import { useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Machine, MachineStatus } from '@/lib/types'

export function useMachines(userId: string | undefined) {
  const [machines, setMachines] = useState<Machine[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  const fetchMachines = useCallback(async (storeId: string) => {
    setIsLoading(machines.length === 0)
    setError(null)
    const { data, error: err } = await supabase
      .from('machines')
      .select()
      .eq('store_id', storeId)
      .order('sort_order')
    if (err) {
      setError('台データの取得に失敗しました')
    } else if (data) {
      setMachines(data)
    }
    setIsLoading(false)
  }, [supabase, machines.length])

  const addMachine = useCallback(async (storeId: string, number: string) => {
    if (!userId) return
    const trimmed = number.trim()
    if (!trimmed) return
    setError(null)
    const { data, error: err } = await supabase
      .from('machines')
      .insert({
        store_id: storeId,
        user_id: userId,
        number: trimmed,
        status: '未確認',
        first_hit_count: 0,
        sort_order: machines.length,
        memo: '',
      })
      .select()
      .single()
    if (err) {
      setError('台の追加に失敗しました')
    } else if (data) {
      setMachines(prev => [...prev, data])
    }
  }, [userId, supabase, machines.length])

  const updateStatus = useCallback(async (machineId: string, newStatus: MachineStatus) => {
    setError(null)
    const { error: err } = await supabase
      .from('machines')
      .update({ status: newStatus })
      .eq('id', machineId)
    if (err) {
      setError('状態の更新に失敗しました')
    } else {
      setMachines(prev => prev.map(m => m.id === machineId ? { ...m, status: newStatus } : m))
    }
  }, [supabase])

  const updateFirstHitCount = useCallback(async (machineId: string, count: number) => {
    setError(null)
    const { error: err } = await supabase
      .from('machines')
      .update({ first_hit_count: count })
      .eq('id', machineId)
    if (err) {
      setError('初当り回数の更新に失敗しました')
    } else {
      setMachines(prev => prev.map(m => m.id === machineId ? { ...m, first_hit_count: count } : m))
    }
  }, [supabase])

  const updateMemo = useCallback(async (machineId: string, memo: string) => {
    setError(null)
    const { error: err } = await supabase
      .from('machines')
      .update({ memo })
      .eq('id', machineId)
    if (err) {
      setError('メモの更新に失敗しました')
    } else {
      setMachines(prev => prev.map(m => m.id === machineId ? { ...m, memo } : m))
    }
  }, [supabase])

  const deleteMachine = useCallback(async (machineId: string) => {
    setError(null)
    const { error: err } = await supabase
      .from('machines')
      .delete()
      .eq('id', machineId)
    if (err) {
      setError('台の削除に失敗しました')
    } else {
      setMachines(prev => prev.filter(m => m.id !== machineId))
    }
  }, [supabase])

  const resetMachines = useCallback(async (storeId: string) => {
    setError(null)
    const { error: err } = await supabase.rpc('reset_store_machines', { p_store_id: storeId })
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
      await supabase.from('machines').update({ sort_order: m.sort_order }).eq('id', m.id)
    }
  }, [supabase, machines])

  return {
    machines, isLoading, error, setMachines,
    fetchMachines, addMachine, updateStatus, updateFirstHitCount,
    updateMemo, deleteMachine, resetMachines, moveMachine,
  }
}
