'use client'

import { useState, useRef, useEffect } from 'react'
import { GripVertical, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { StatusPicker } from '@/components/shared/status-picker'
import type { Machine, MachineStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MachineRowProps {
  machine: Machine
  onStatusChange: (status: MachineStatus) => void
  onCountChange: (count: number) => void
  onMemoChange: (memo: string) => void
  onDelete: () => void
}

export function MachineRow({ machine, onStatusChange, onCountChange, onMemoChange, onDelete }: MachineRowProps) {
  const [countText, setCountText] = useState(String(machine.first_hit_count))
  const [memoText, setMemoText] = useState(machine.memo)
  const countRef = useRef<HTMLInputElement>(null)
  const memoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (document.activeElement !== countRef.current) {
      setCountText(String(machine.first_hit_count))
    }
  }, [machine.first_hit_count])

  useEffect(() => {
    if (document.activeElement !== memoRef.current) {
      setMemoText(machine.memo)
    }
  }, [machine.memo])

  const commitCount = () => {
    const val = parseInt(countText)
    if (!isNaN(val) && val >= 0 && val !== machine.first_hit_count) {
      onCountChange(val)
    }
  }

  const commitMemo = () => {
    if (memoText !== machine.memo) {
      onMemoChange(memoText)
    }
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: machine.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-start gap-2 rounded-xl p-3 bg-card border shadow-sm',
        isDragging && 'opacity-50'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab text-muted-foreground/50 hover:text-muted-foreground touch-none"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          {/* Machine number */}
          <span className="font-mono text-lg font-bold min-w-[50px]">{machine.number}</span>

          {/* Status */}
          <StatusPicker status={machine.status} onChange={onStatusChange} />

          <div className="flex-1" />

          {/* First hit count */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">初当:</span>
            <input
              ref={countRef}
              type="number"
              min="0"
              value={countText}
              onChange={e => setCountText(e.target.value)}
              onBlur={commitCount}
              onKeyDown={e => e.key === 'Enter' && commitCount()}
              className="w-12 rounded-md bg-muted px-2 py-1 text-center font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Delete */}
          <button onClick={onDelete} className="text-muted-foreground/50 hover:text-destructive transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Memo */}
        <div className="flex items-center gap-1">
          <input
            ref={memoRef}
            value={memoText}
            onChange={e => setMemoText(e.target.value)}
            onBlur={commitMemo}
            onKeyDown={e => e.key === 'Enter' && commitMemo()}
            placeholder="メモ"
            className="flex-1 bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/40"
          />
        </div>
      </div>
    </div>
  )
}
