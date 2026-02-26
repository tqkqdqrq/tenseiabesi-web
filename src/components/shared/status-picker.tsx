'use client'

import { MACHINE_STATUSES, STATUS_COLORS, STATUS_DOT_COLORS } from '@/lib/constants'
import type { MachineStatus } from '@/lib/types'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface StatusPickerProps {
  status: string
  onChange: (status: MachineStatus) => void
}

export function StatusPicker({ status, onChange }: StatusPickerProps) {
  const current = status as MachineStatus
  const colors = STATUS_COLORS[current] ?? STATUS_COLORS['未確認']

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors cursor-pointer',
            colors.bg, colors.text
          )}
        >
          <span className={cn('h-2 w-2 rounded-full', STATUS_DOT_COLORS[current] ?? 'bg-gray-400')} />
          {current}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {MACHINE_STATUSES.map(s => (
          <DropdownMenuItem key={s} onClick={() => onChange(s)} className="gap-2">
            <span className={cn('h-2 w-2 rounded-full', STATUS_DOT_COLORS[s])} />
            {s}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
