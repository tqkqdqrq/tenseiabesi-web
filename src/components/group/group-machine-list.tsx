'use client'

import { GroupMachineRow } from './group-machine-row'
import type { GroupMachineWithProfiles, MachineStatus, HighlightInfo, GroupTag } from '@/lib/types'

interface GroupMachineListProps {
  machines: GroupMachineWithProfiles[]
  tags?: GroupTag[]
  highlightedMachines: Map<string, HighlightInfo>
  onStatusChange: (id: string, status: MachineStatus) => void
  onCountChange: (id: string, count: number) => void
  onMemoChange: (id: string, memo: string) => void
  onDelete: (id: string) => void
  onReorder: (oldIndex: number, newIndex: number) => void
  onPushNotify?: (machineNumber: string) => void
}

export function GroupMachineList({
  machines, tags, highlightedMachines,
  onStatusChange, onCountChange, onMemoChange, onDelete, onReorder, onPushNotify,
}: GroupMachineListProps) {
  return (
    <div className="space-y-2">
      {machines.map((machine, i) => (
        <GroupMachineRow
          key={machine.id}
          machine={machine}
          tags={tags}
          highlightInfo={highlightedMachines.get(machine.id)}
          onStatusChange={s => onStatusChange(machine.id, s)}
          onCountChange={c => onCountChange(machine.id, c)}
          onMemoChange={m => onMemoChange(machine.id, m)}
          onDelete={() => onDelete(machine.id)}
          onMoveUp={() => onReorder(i, i - 1)}
          onMoveDown={() => onReorder(i, i + 1)}
          isFirst={i === 0}
          isLast={i === machines.length - 1}
          onPushNotify={onPushNotify ? () => onPushNotify(machine.number) : undefined}
        />
      ))}
    </div>
  )
}
