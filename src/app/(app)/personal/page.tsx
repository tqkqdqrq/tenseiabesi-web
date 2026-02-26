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
import { Building2, Database } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function PersonalPage() {
  const { user } = useAuth()
  const storeHook = useStores(user?.id)
  const machineHook = useMachines(user?.id)
  const [showAddStore, setShowAddStore] = useState(false)
  const [showDeleteStore, setShowDeleteStore] = useState(false)
  const [showReset, setShowReset] = useState(false)

  useEffect(() => {
    storeHook.fetchStores()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (storeHook.selectedStore) {
      machineHook.fetchMachines(storeHook.selectedStore.id)
    }
  }, [storeHook.selectedStore?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = useCallback(async () => {
    await storeHook.fetchStores()
    if (storeHook.selectedStore) {
      await machineHook.fetchMachines(storeHook.selectedStore.id)
    }
  }, [storeHook, machineHook])

  const error = storeHook.error || machineHook.error

  if (storeHook.isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (storeHook.stores.length === 0) {
    return (
      <>
        <EmptyState
          icon={Building2}
          title="店舗がありません"
          description="まず店舗を追加してください"
          actionLabel="店舗を追加"
          onAction={() => setShowAddStore(true)}
        />
        <AddStoreDialog open={showAddStore} onOpenChange={setShowAddStore} onAdd={storeHook.addStore} />
      </>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3 space-y-3">
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
