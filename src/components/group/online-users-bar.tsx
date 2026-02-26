'use client'

import { Circle } from 'lucide-react'
import type { PresenceUser } from '@/lib/types'

interface OnlineUsersBarProps {
  users: PresenceUser[]
}

export function OnlineUsersBar({ users }: OnlineUsersBarProps) {
  if (users.length === 0) return null

  return (
    <div className="flex items-center gap-2 overflow-x-auto px-1 py-1">
      <Circle className="h-2 w-2 fill-green-500 text-green-500 shrink-0" />
      <span className="text-xs text-muted-foreground shrink-0">オンライン:</span>
      {users.map(user => (
        <span key={user.user_id} className="text-xs font-medium shrink-0 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full px-2 py-0.5">
          {user.display_name}
        </span>
      ))}
    </div>
  )
}
