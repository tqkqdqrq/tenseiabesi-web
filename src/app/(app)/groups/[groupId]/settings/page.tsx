'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { useGroupMembers } from '@/hooks/use-group-members'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { InviteCodeDisplay } from '@/components/group/invite-code-display'
import { MemberList } from '@/components/group/member-list'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from 'lucide-react'
import type { SlotGroup } from '@/lib/types'

export default function GroupSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.groupId as string
  const { user } = useAuth()
  const membersHook = useGroupMembers()
  const [group, setGroup] = useState<SlotGroup | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('groups').select().eq('id', groupId).single()
      if (data) setGroup(data)
    }
    fetch()
    membersHook.fetchMembers(groupId)
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
      </div>
    </div>
  )
}
