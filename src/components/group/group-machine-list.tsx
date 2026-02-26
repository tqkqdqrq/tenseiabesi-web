'use client'

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { GroupMachineRow } from './group-machine-row'
import type { GroupMachineWithProfiles, MachineStatus, HighlightInfo } from '@/lib/types'

interface GroupMachineListProps {
  machines: GroupMachineWithProfiles[]
  highlightedMachines: Map<string, HighlightInfo>
  onStatusChange: (id: string, status: MachineStatus) => void
  onCountChange: (id: string, count: number) => void
  onMemoChange: (id: string, memo: string) => void
  onDelete: (id: string) => void
  onReorder: (oldIndex: number, newIndex: number) => void
}

export function GroupMachineList({
  machines, highlightedMachines,
  onStatusChange, onCountChange, onMemoChange, onDelete, onReorder,
}: GroupMachineListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = machines.findIndex(m => m.id === active.id)
      const newIndex = machines.findIndex(m => m.id === over.id)
      onReorder(oldIndex, newIndex)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
      <SortableContext items={machines.map(m => m.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {machines.map(machine => (
            <GroupMachineRow
              key={machine.id}
              machine={machine}
              highlightInfo={highlightedMachines.get(machine.id)}
              onStatusChange={s => onStatusChange(machine.id, s)}
              onCountChange={c => onCountChange(machine.id, c)}
              onMemoChange={m => onMemoChange(machine.id, m)}
              onDelete={() => onDelete(machine.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
