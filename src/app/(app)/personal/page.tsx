'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useStores } from '@/hooks/use-stores'
import { useMachines } from '@/hooks/use-machines'
import { StoreBar } from '@/components/personal/store-bar'
import { MachineInputBar } from '@/components/personal/machine-input-bar'
import { MachineList } from '@/components/personal/machine-list'
import { AddStoreDialog } from '@/components/shared/add-store-dialog'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { Building2, Database, ChevronDown, ChevronUp, Hash } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export default function PersonalPage() {
  const { user } = useAuth()
  const storeHook = useStores(user?.id)
  const machineHook = useMachines(user?.id)
  console.log('[PersonalPage] render:', { userId: user?.id, isLoading: storeHook.isLoading, storesCount: storeHook.stores.length, error: storeHook.error })
  const [showAddStore, setShowAddStore] = useState(false)
  const [showDeleteStore, setShowDeleteStore] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [headerOpen, setHeaderOpen] = useState(true)
  const [isFirstVisit, setIsFirstVisit] = useState(false)

  const fetchStores = storeHook.fetchStores
  const fetchMachines = machineHook.fetchMachines
  const selectedStoreId = storeHook.selectedStore?.id

  useEffect(() => {
    const saved = localStorage.getItem('headerOpen_personal')
    if (saved !== null) {
      setHeaderOpen(saved === 'true')
    } else {
      setIsFirstVisit(true)
    }
  }, [])

  const toggleHeader = () => {
    setHeaderOpen(v => {
      localStorage.setItem('headerOpen_personal', String(!v))
      if (isFirstVisit) setIsFirstVisit(false)
      return !v
    })
  }

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  useEffect(() => {
    if (selectedStoreId) {
      fetchMachines(selectedStoreId)
    }
  }, [selectedStoreId, fetchMachines])

  const handleRefresh = useCallback(async () => {
    await fetchStores()
    if (selectedStoreId) {
      await fetchMachines(selectedStoreId)
    }
  }, [fetchStores, fetchMachines, selectedStoreId])

  const error = storeHook.error || machineHook.error

  console.log('[PersonalPage] isLoading check:', storeHook.isLoading)
  if (storeHook.isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  console.log('[PersonalPage] stores check:', storeHook.stores.length)
  if (storeHook.stores.length === 0) {
    return (
      <>
        {storeHook.error ? (
          <EmptyState
            icon={Building2}
            title="データの読み込みに失敗しました"
            description={storeHook.error}
            actionLabel="再試行"
            onAction={() => fetchStores()}
          />
        ) : (
          <EmptyState
            icon={Building2}
            title="店舗がありません"
            description="まず店舗を追加してください"
            actionLabel="店舗を追加"
            onAction={() => setShowAddStore(true)}
          />
        )}
        <AddStoreDialog open={showAddStore} onOpenChange={setShowAddStore} onAdd={storeHook.addStore} />
      </>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-2">
        <button
          className="flex items-center justify-between w-full py-1 rounded-md"
          onClick={toggleHeader}
        >
          <span className="text-sm text-muted-foreground truncate">
            {storeHook.selectedStore?.name ?? '店舗未選択'}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <Hash className="h-3.5 w-3.5" />
            {headerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>
        {headerOpen && (
          <>
            <div className="space-y-3 pt-2 pb-1">
              <StoreBar
                stores={storeHook.stores}
                selectedStore={storeHook.selectedStore}
                onSelect={s => storeHook.setSelectedStore(storeHook.stores.find(st => st.id === s.id) ?? null)}
                onAddClick={() => setShowAddStore(true)}
                onDeleteClick={() => setShowDeleteStore(true)}
              />
              {storeHook.selectedStore && (
                <MachineInputBar
                  onAdd={num => machineHook.addMachine(storeHook.selectedStore!.id, num)}
                  onReset={() => setShowReset(true)}
                />
              )}
            </div>
            {isFirstVisit && (
              <p className="text-xs text-muted-foreground text-center mt-1">
                ↑ 上のアイコンをタップすると閉じられます
              </p>
            )}
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Machine list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {machineHook.isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : machineHook.machines.length === 0 ? (
          <EmptyState icon={Database} title="台データがありません" description="台番号を入力して追加してください" />
        ) : (
          <MachineList
            machines={machineHook.machines}
            onStatusChange={machineHook.updateStatus}
            onCountChange={machineHook.updateFirstHitCount}
            onMemoChange={machineHook.updateMemo}
            onDelete={machineHook.deleteMachine}
            onReorder={machineHook.moveMachine}
          />
        )}
      </div>

      {/* Dialogs */}
      <AddStoreDialog open={showAddStore} onOpenChange={setShowAddStore} onAdd={storeHook.addStore} />
      <ConfirmDialog
        open={showDeleteStore}
        onOpenChange={setShowDeleteStore}
        title="店舗を削除"
        description={`「${storeHook.selectedStore?.name}」を削除しますか？台データもすべて削除されます。`}
        confirmLabel="削除"
        onConfirm={() => { if (storeHook.selectedStore) storeHook.deleteStore(storeHook.selectedStore) }}
      />
      <ConfirmDialog
        open={showReset}
        onOpenChange={setShowReset}
        title="リセット"
        description="すべての台のステータス・初当回数・メモをリセットしますか？"
        confirmLabel="リセット"
        onConfirm={() => { if (storeHook.selectedStore) machineHook.resetMachines(storeHook.selectedStore.id) }}
      />
    </div>
  )
}
