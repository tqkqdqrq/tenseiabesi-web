'use client'

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { MachineRow } from './machine-row'
import type { Machine, MachineStatus } from '@/lib/types'

interface MachineListProps {
  machines: Machine[]
  onStatusChange: (id: string, status: MachineStatus) => void
  onCountChange: (id: string, count: number) => void
  onMemoChange: (id: string, memo: string) => void
  onDelete: (id: string) => void
  onReorder: (oldIndex: number, newIndex: number) => void
}

export function MachineList({ machines, onStatusChange, onCountChange, onMemoChange, onDelete, onReorder }: MachineListProps) {
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
            <MachineRow
              key={machine.id}
              machine={machine}
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
