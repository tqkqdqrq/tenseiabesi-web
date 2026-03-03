'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { useGroupMembers } from '@/hooks/use-group-members'
import { useGroups } from '@/hooks/use-groups'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { InviteCodeDisplay } from '@/components/group/invite-code-display'
import { MemberList } from '@/components/group/member-list'
import { CreateGroupDialog } from '@/components/group/create-group-dialog'
import { JoinGroupDialog } from '@/components/group/join-group-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ArrowLeft, ArrowRight, Check, Plus, LogIn, Trash2 } from 'lucide-react'
import type { SlotGroup } from '@/lib/types'

export default function GroupSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.groupId as string
  const { user, profile } = useAuth()
  const membersHook = useGroupMembers()
  const groupsHook = useGroups(user?.id)
  const [group, setGroup] = useState<SlotGroup | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [showDeleteGroup, setShowDeleteGroup] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('groups').select().eq('id', groupId).single()
      if (data) setGroup(data)
    }
    fetch()
    membersHook.fetchMembers(groupId)
    groupsHook.fetchGroups()
  }, [groupId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!group) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/groups/${groupId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold">グループ設定</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-lg mx-auto w-full">
        {/* Group switcher */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">グループ切替</h2>
          <div className="rounded-lg border divide-y">
            {groupsHook.groups.map(g => {
              const isCurrent = g.id === groupId
              return (
                <button
                  key={g.id}
                  className={`flex items-center w-full px-3 py-2.5 text-left text-sm ${isCurrent ? 'bg-accent' : ''}`}
                  onClick={() => { if (!isCurrent) router.push(`/groups/${g.id}`) }}
                >
                  <span className="flex-1 truncate font-medium">{g.name}</span>
                  {isCurrent
                    ? <Check className="h-4 w-4 text-primary shrink-0" />
                    : <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>
              )
            })}
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1" />作成
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowJoin(true)}>
              <LogIn className="h-4 w-4 mr-1" />参加
            </Button>
          </div>
        </div>
        <Separator />

        {/* Group name */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-1">グループ名</h2>
          <p className="text-lg font-bold">{group.name}</p>
        </div>

        <Separator />

        {/* Invite code */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">招待コード</h2>
          <InviteCodeDisplay inviteCode={group.invite_code} groupName={group.name} />
        </div>

        <Separator />

        {/* Members */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">
            メンバー ({membersHook.members.filter(m => m.status === 'approved').length}人)
          </h2>
          {membersHook.error && <p className="text-sm text-destructive mb-2">{membersHook.error}</p>}
          {membersHook.isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <MemberList
              members={membersHook.members}
              currentUserId={user?.id}
              leaderId={group.leader_id}
              onApprove={membersHook.approveMember}
              onReject={membersHook.rejectMember}
              onRemove={membersHook.removeMember}
            />
          )}
        </div>

        {/* Delete group (leader only) */}
        {group.leader_id === user?.id && (
          <>
            <Separator />
            <div>
              <h2 className="text-sm font-semibold text-destructive mb-1">グループ削除</h2>
              <p className="text-xs text-muted-foreground mb-3">
                グループを削除すると、すべてのデータが失われ、復元できません。
              </p>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteGroup(true)}>
                <Trash2 className="h-4 w-4 mr-1" />グループを削除
              </Button>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteGroup}
        onOpenChange={setShowDeleteGroup}
        title="グループを削除"
        description={`「${group.name}」を削除しますか？すべてのデータが失われ、復元できません。`}
        confirmLabel="削除"
        onConfirm={async () => {
          await groupsHook.deleteGroup(groupId)
          localStorage.removeItem('lastGroupId')
          router.push('/groups')
        }}
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
