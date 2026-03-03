'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { useGroupData } from '@/hooks/use-group-data'
import { usePresence } from '@/hooks/use-presence'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useGroups } from '@/hooks/use-groups'
import { StoreBar } from '@/components/personal/store-bar'
import { MachineInputBar } from '@/components/personal/machine-input-bar'
import { GroupMachineList } from '@/components/group/group-machine-list'
import { OnlineUsersBar } from '@/components/group/online-users-bar'
import { AddStoreDialog } from '@/components/shared/add-store-dialog'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { CreateGroupDialog } from '@/components/group/create-group-dialog'
import { JoinGroupDialog } from '@/components/group/join-group-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Settings, Building2, Database, ChevronDown, ChevronUp, Users, Hash, Check, Plus, LogIn } from 'lucide-react'
import type { SlotGroup, MachineChange, MachineChangeType, GroupMachineWithProfiles } from '@/lib/types'
import type { RealtimeChannel } from '@supabase/supabase-js'
import Link from 'next/link'

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.groupId as string
  const { user, profile } = useAuth()
  const gd = useGroupData(user?.id)
  const groupsHook = useGroups(user?.id)
  const { onlineUsers } = usePresence({ groupId, userId: user?.id, displayName: profile?.display_name })

  const [group, setGroup] = useState<SlotGroup | null>(null)
  const [showAddStore, setShowAddStore] = useState(false)
  const [showDeleteStore, setShowDeleteStore] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [headerOpen, setHeaderOpen] = useState(true)
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [storeSwitcherOpen, setStoreSwitcherOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)

  const supabase = getSupabaseBrowserClient()
  const broadcastChannelRef = useRef<RealtimeChannel | null>(null)
  const pgChannelRef = useRef<RealtimeChannel | null>(null)

  // Blur any focused element on mount to prevent iOS Safari viewport shift
  useEffect(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }, [])

  // Save last opened group to localStorage
  useEffect(() => {
    localStorage.setItem('lastGroupId', groupId)
  }, [groupId])

  // Header open/close persistence
  useEffect(() => {
    const saved = localStorage.getItem('headerOpen_group')
    if (saved !== null) {
      setHeaderOpen(saved === 'true')
    } else {
      setIsFirstVisit(true)
    }
  }, [])

  const toggleHeader = () => {
    setHeaderOpen(v => {
      localStorage.setItem('headerOpen_group', String(!v))
      if (isFirstVisit) setIsFirstVisit(false)
      return !v
    })
  }

  // Fetch group info
  useEffect(() => {
    const fetchGroup = async () => {
      const { data } = await supabase.from('groups').select().eq('id', groupId).single()
      if (data) setGroup(data)
    }
    fetchGroup()
    gd.loadCurrentProfile()
    groupsHook.fetchGroups()
  }, [groupId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch stores
  useEffect(() => {
    gd.fetchStores(groupId)
  }, [groupId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch machines when store changes
  useEffect(() => {
    if (gd.selectedStore) {
      gd.fetchMachines(gd.selectedStore.id)
    }
  }, [gd.selectedStore?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Postgres Changes subscription
  useEffect(() => {
    if (!groupId) return

    const channel = supabase
      .channel(`pg-group_machines-${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_machines', filter: `group_id=eq.${groupId}` },
        () => {
          if (gd.selectedStore) gd.fetchMachines(gd.selectedStore.id)
        }
      )
      .subscribe()

    pgChannelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [groupId, gd.selectedStore?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Broadcast subscription
  useEffect(() => {
    if (!groupId) return

    const channel = supabase.channel(`group-${groupId}`)

    channel.on('broadcast', { event: 'machines_changed' }, ({ payload }) => {
      if (!payload) return
      const p = payload as Partial<MachineChange>
      if (!p.changer_user_id || p.changer_user_id === user?.id) return
      if (p.store_id && p.store_id !== gd.selectedStore?.id) return

      // Refetch
      if (gd.selectedStore) gd.fetchMachines(gd.selectedStore.id)

      // Highlight
      if (p.machine_id && p.change_type && p.changer_name &&
          p.change_type !== 'reset' && p.change_type !== 'reordered') {
        gd.addHighlight(p.machine_id, {
          changer_name: p.changer_name,
          change_type: p.change_type as MachineChangeType,
        })
      }
    }).subscribe()

    broadcastChannelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [groupId, gd.selectedStore?.id, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Broadcast helper
  const broadcast = useCallback(async (machineId?: string, changeType?: MachineChangeType) => {
    const channel = broadcastChannelRef.current
    if (!channel || !user?.id || !gd.currentProfile || !gd.selectedStore) return
    if (machineId && changeType) {
      await channel.send({
        type: 'broadcast',
        event: 'machines_changed',
        payload: {
          machine_id: machineId,
          change_type: changeType,
          changer_user_id: user.id,
          changer_name: gd.currentProfile.display_name,
          store_id: gd.selectedStore.id,
        } satisfies MachineChange,
      })
    } else {
      await channel.send({ type: 'broadcast', event: 'machines_changed', payload: {} })
    }
  }, [user?.id, gd.currentProfile, gd.selectedStore])

  // Wrapped CRUD with broadcast
  const handleAddMachine = async (num: string) => {
    if (!gd.selectedStore || !group) return
    const id = await gd.addMachine(gd.selectedStore.id, group.id, num)
    if (id) await broadcast(id, 'added')
  }

  const handleStatusChange = async (id: string, status: import('@/lib/types').MachineStatus) => {
    await gd.updateStatus(id, status)
    await broadcast(id, 'statusUpdated')
  }

  const handleCountChange = async (id: string, count: number) => {
    await gd.updateFirstHitCount(id, count)
    await broadcast(id, 'countUpdated')
  }

  const handleMemoChange = async (id: string, memo: string) => {
    await gd.updateMemo(id, memo)
    await broadcast(id, 'memoUpdated')
  }

  const handleDelete = async (id: string) => {
    await gd.deleteMachine(id)
    await broadcast(id, 'deleted')
  }

  const handleReset = async () => {
    if (!gd.selectedStore) return
    await gd.resetMachines(gd.selectedStore.id)
    await broadcast(undefined, 'reset')
  }

  const handleReorder = async (oldIndex: number, newIndex: number) => {
    await gd.moveMachine(oldIndex, newIndex)
    await broadcast(undefined, 'reordered')
  }

  if (!group) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Popover open={switcherOpen} onOpenChange={setSwitcherOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 min-w-0 hover:opacity-70 transition-opacity">
                <h1 className="text-lg font-bold truncate">{group.name}</h1>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0 w-64">
              <div className="p-2 border-b">
                <p className="text-xs font-semibold text-muted-foreground px-2">グループ切替</p>
              </div>
              <div className="divide-y max-h-60 overflow-y-auto">
                {groupsHook.groups.map(g => {
                  const isCurrent = g.id === groupId
                  return (
                    <button
                      key={g.id}
                      className={`flex items-center w-full px-3 py-2.5 text-left text-sm ${isCurrent ? 'bg-accent' : 'hover:bg-muted'}`}
                      onClick={() => {
                        if (!isCurrent) router.push(`/groups/${g.id}`)
                        setSwitcherOpen(false)
                      }}
                    >
                      <span className="flex-1 truncate font-medium">{g.name}</span>
                      {isCurrent && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2 p-2 border-t">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSwitcherOpen(false); setShowCreate(true) }}>
                  <Plus className="h-4 w-4 mr-1" />作成
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSwitcherOpen(false); setShowJoin(true) }}>
                  <LogIn className="h-4 w-4 mr-1" />参加
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          {!headerOpen && gd.stores.length > 0 && (
            <Popover open={storeSwitcherOpen} onOpenChange={setStoreSwitcherOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 min-w-0 hover:opacity-70 transition-opacity">
                  <span className="text-sm text-muted-foreground">
                    {(gd.selectedStore?.name ?? '店舗未選択').length > 8
                      ? (gd.selectedStore?.name ?? '店舗未選択').slice(0, 8) + '…'
                      : (gd.selectedStore?.name ?? '店舗未選択')}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0 w-56">
                <div className="p-2 border-b">
                  <p className="text-xs font-semibold text-muted-foreground px-2">店舗切替</p>
                </div>
                <div className="divide-y max-h-60 overflow-y-auto">
                  {gd.stores.map(s => {
                    const isCurrent = s.id === gd.selectedStore?.id
                    return (
                      <button
                        key={s.id}
                        className={`flex items-center w-full px-3 py-2.5 text-left text-sm ${isCurrent ? 'bg-accent' : 'hover:bg-muted'}`}
                        onClick={() => {
                          gd.setSelectedStore(gd.stores.find(st => st.id === s.id) ?? null)
                          setStoreSwitcherOpen(false)
                        }}
                      >
                        <span className="flex-1 truncate font-medium">{s.name}</span>
                        {isCurrent && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>
          )}
          <div className="flex-1" />
          <button
            className="flex items-center gap-1 px-1.5 py-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            onClick={toggleHeader}
          >
            <Users className="h-3.5 w-3.5" />
            <Building2 className="h-3.5 w-3.5" />
            <Hash className="h-3.5 w-3.5" />
            {headerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <Link href={`/groups/${groupId}/settings`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {headerOpen && (
          <>
            <div className="space-y-3 pt-2 pb-1">
              <OnlineUsersBar users={onlineUsers} />

              {gd.stores.length > 0 && (
                <>
                  <StoreBar
                    stores={gd.stores}
                    selectedStore={gd.selectedStore}
                    onSelect={s => gd.setSelectedStore(gd.stores.find(st => st.id === s.id) ?? null)}
                    onAddClick={() => setShowAddStore(true)}
                    onDeleteClick={() => setShowDeleteStore(true)}
                  />
                  {gd.selectedStore && (
                    <MachineInputBar
                      onAdd={handleAddMachine}
                      onReset={() => setShowReset(true)}
                    />
                  )}
                </>
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

      {gd.error && (
        <div className="px-4 py-2">
          <p className="text-sm text-destructive">{gd.error}</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {gd.stores.length === 0 && !gd.isLoading ? (
          <EmptyState
            icon={Building2}
            title="店舗がありません"
            description="店舗を追加してください"
            actionLabel="店舗を追加"
            onAction={() => setShowAddStore(true)}
          />
        ) : gd.isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : gd.machines.length === 0 ? (
          <EmptyState icon={Database} title="台データがありません" description="台番号を入力して追加してください" />
        ) : (
          <GroupMachineList
            machines={gd.machines}
            highlightedMachines={gd.highlightedMachines}
            onStatusChange={handleStatusChange}
            onCountChange={handleCountChange}
            onMemoChange={handleMemoChange}
            onDelete={handleDelete}
            onReorder={handleReorder}
          />
        )}
      </div>

      {/* Dialogs */}
      <AddStoreDialog
        open={showAddStore}
        onOpenChange={setShowAddStore}
        onAdd={name => gd.addStore(groupId, name)}
      />
      <ConfirmDialog
        open={showDeleteStore}
        onOpenChange={setShowDeleteStore}
        title="店舗を削除"
        description={`「${gd.selectedStore?.name}」を削除しますか？台データもすべて削除されます。`}
        confirmLabel="削除"
        onConfirm={() => { if (gd.selectedStore) gd.deleteStore(gd.selectedStore) }}
      />
      <ConfirmDialog
        open={showReset}
        onOpenChange={setShowReset}
        title="リセット"
        description="すべての台のステータス・初当回数・メモをリセットしますか？"
        confirmLabel="リセット"
        onConfirm={handleReset}
      />
      <CreateGroupDialog open={showCreate} onOpenChange={setShowCreate} onCreate={(name: string) => groupsHook.createGroup(name, profile?.plan)} />
      <JoinGroupDialog
        open={showJoin}
        onOpenChange={open => {
          setShowJoin(open)
          if (!open) { groupsHook.setError(null); groupsHook.setSuccessMessage(null) }
        }}
        onJoin={groupsHook.joinGroup}
        error={groupsHook.error}
        success={groupsHook.successMessage}
      />
    </div>
  )
}
