'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { useGroups } from '@/hooks/use-groups'
import { CreateGroupDialog } from '@/components/group/create-group-dialog'
import { JoinGroupDialog } from '@/components/group/join-group-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Plus, LogIn, ChevronRight, Trash2, Crown } from 'lucide-react'

export default function GroupsPage() {
  const { user } = useAuth()
  const groupsHook = useGroups(user?.id)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  useEffect(() => {
    groupsHook.fetchGroups()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (groupsHook.isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">グループ</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowJoin(true)}>
              <LogIn className="h-4 w-4 mr-1" />
              参加
            </Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1" />
              作成
            </Button>
          </div>
        </div>
      </div>

      {groupsHook.error && (
        <div className="px-4 py-2">
          <p className="text-sm text-destructive">{groupsHook.error}</p>
        </div>
      )}

      {/* Group list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {groupsHook.groups.length === 0 ? (
          <EmptyState
            icon={Users}
            title="グループがありません"
            description="グループを作成するか、招待コードで参加してください"
          />
        ) : (
          <div className="space-y-2">
            {groupsHook.groups.map(group => (
              <div key={group.id} className="flex items-center rounded-xl border bg-card p-3 shadow-sm">
                <Link href={`/groups/${group.id}`} className="flex-1 flex items-center gap-3 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{group.name}</span>
                      {group.leader_id === user?.id && (
                        <Crown className="h-3 w-3 text-yellow-500 shrink-0" />
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
                {group.leader_id === user?.id && (
                  <button
                    onClick={() => setDeleteTarget(group.id)}
                    className="ml-2 text-muted-foreground/50 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateGroupDialog open={showCreate} onOpenChange={setShowCreate} onCreate={groupsHook.createGroup} />
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
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="グループを削除"
        description="このグループを削除しますか？メンバーや共有データもすべて削除されます。"
        confirmLabel="削除"
        onConfirm={() => { if (deleteTarget) groupsHook.deleteGroup(deleteTarget) }}
      />
    </div>
  )
}
