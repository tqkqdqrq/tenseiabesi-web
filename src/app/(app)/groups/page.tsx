'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { useGroups } from '@/hooks/use-groups'
import { CreateGroupDialog } from '@/components/group/create-group-dialog'
import { JoinGroupDialog } from '@/components/group/join-group-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Plus, LogIn } from 'lucide-react'

export default function GroupsPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const groupsHook = useGroups(user?.id)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const redirectedRef = useRef(false)

  useEffect(() => {
    groupsHook.fetchGroups()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-redirect to last opened group
  useEffect(() => {
    if (groupsHook.isLoading || redirectedRef.current) return
    if (groupsHook.groups.length === 0) return

    const lastGroupId = localStorage.getItem('lastGroupId')
    const target = groupsHook.groups.find(g => g.id === lastGroupId) ?? groupsHook.groups[0]
    redirectedRef.current = true
    router.replace(`/groups/${target.id}`)
  }, [groupsHook.isLoading, groupsHook.groups, router])

  // Loading or about to redirect
  if (groupsHook.isLoading || groupsHook.groups.length > 0) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    )
  }

  // No groups — show create/join screen
  return (
    <div className="flex flex-col h-full items-center justify-center px-6">
      <Users className="h-12 w-12 text-muted-foreground mb-4" />
      <h1 className="text-lg font-bold mb-1">チームに参加しよう</h1>
      <p className="text-sm text-muted-foreground text-center mb-6">
        グループを作成するか、招待コードで参加してください
      </p>
      <div className="flex gap-3 w-full max-w-xs">
        <Button variant="outline" className="flex-1" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" />作成
        </Button>
        <Button className="flex-1" onClick={() => setShowJoin(true)}>
          <LogIn className="h-4 w-4 mr-1" />参加
        </Button>
      </div>

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
