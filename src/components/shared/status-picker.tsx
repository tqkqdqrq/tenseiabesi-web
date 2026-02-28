'use client'

import { MACHINE_STATUSES, STATUS_ACTIVE_COLORS, STATUS_LABELS } from '@/lib/constants'
import type { MachineStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StatusPickerProps {
  status: string
  onChange: (status: MachineStatus) => void
}

export function StatusPicker({ status, onChange }: StatusPickerProps) {
  const current = status as MachineStatus

  return (
    <div className="grid grid-cols-2 gap-1 p-1 bg-muted/40 rounded-lg shrink-0">
      {MACHINE_STATUSES.map(s => {
        const isActive = current === s
        const colors = STATUS_ACTIVE_COLORS[s]
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              'px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 flex items-center justify-center',
              isActive
                ? [colors.bg, colors.text, 'ring-2 ring-offset-1 ring-offset-background shadow-sm', colors.ring]
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {STATUS_LABELS[s]}
          </button>
        )
      })}
    </div>
  )
}
