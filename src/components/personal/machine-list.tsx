'use client'

import { MachineRow } from './machine-row'
import type { Machine, MachineStatus, DisplayTag } from '@/lib/types'

interface MachineListProps {
  machines: Machine[]
  tags?: DisplayTag[]
  onStatusChange: (id: string, status: MachineStatus) => void
  onCountChange: (id: string, count: number) => void
  onMemoChange: (id: string, memo: string) => void
  onDelete: (id: string) => void
  onReorder: (oldIndex: number, newIndex: number) => void
}

export function MachineList({ machines, tags, onStatusChange, onCountChange, onMemoChange, onDelete, onReorder }: MachineListProps) {
  return (
    <div className="space-y-2">
      {machines.map((machine, i) => (
        <MachineRow
          key={machine.id}
          machine={machine}
          tags={tags}
          onStatusChange={s => onStatusChange(machine.id, s)}
          onCountChange={c => onCountChange(machine.id, c)}
          onMemoChange={m => onMemoChange(machine.id, m)}
          onDelete={() => onDelete(machine.id)}
          onMoveUp={() => onReorder(i, i - 1)}
          onMoveDown={() => onReorder(i, i + 1)}
          isFirst={i === 0}
          isLast={i === machines.length - 1}
        />
      ))}
    </div>
  )
}
