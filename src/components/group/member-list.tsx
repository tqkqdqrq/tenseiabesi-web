'use client'

import { Check, X, UserMinus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { GroupMemberWithProfile } from '@/lib/types'

interface MemberListProps {
  members: GroupMemberWithProfile[]
  currentUserId: string | undefined
  leaderId: string
  onApprove: (memberId: string) => void
  onReject: (memberId: string) => void
  onRemove: (memberId: string) => void
}

export function MemberList({ members, currentUserId, leaderId, onApprove, onReject, onRemove }: MemberListProps) {
  const isLeader = currentUserId === leaderId

  return (
    <div className="space-y-2">
      {members.map(member => (
        <div key={member.id} className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{member.profile?.display_name ?? '不明'}</span>
            {member.role === 'leader' && (
              <Badge variant="secondary" className="text-xs">リーダー</Badge>
            )}
            {member.status === 'pending' && (
              <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-400">申請中</Badge>
            )}
            {member.status === 'rejected' && (
              <Badge variant="outline" className="text-xs text-red-600 border-red-400">拒否</Badge>
            )}
          </div>
          {isLeader && member.user_id !== currentUserId && (
            <div className="flex gap-1">
              {member.status === 'pending' && (
                <>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => onApprove(member.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => onReject(member.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              {member.status === 'approved' && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemove(member.id)}>
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
