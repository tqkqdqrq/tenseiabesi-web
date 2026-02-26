'use client'

import { useState, useRef, useEffect } from 'react'
import { GripVertical, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { StatusPicker } from '@/components/shared/status-picker'
import type { GroupMachineWithProfiles, MachineStatus, HighlightInfo } from '@/lib/types'
import { cn } from '@/lib/utils'

interface GroupMachineRowProps {
  machine: GroupMachineWithProfiles
  highlightInfo?: HighlightInfo
  onStatusChange: (status: MachineStatus) => void
  onCountChange: (count: number) => void
  onMemoChange: (memo: string) => void
  onDelete: () => void
}

export function GroupMachineRow({ machine, highlightInfo, onStatusChange, onCountChange, onMemoChange, onDelete }: GroupMachineRowProps) {
  const [countText, setCountText] = useState(String(machine.first_hit_count))
  const [memoText, setMemoText] = useState(machine.memo)
  const countRef = useRef<HTMLInputElement>(null)
  const memoRef = useRef<HTMLInputElement>(null)
  const isHighlighted = !!highlightInfo

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

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: machine.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative flex items-start gap-2 rounded-xl p-3 bg-card border shadow-sm transition-all',
        isDragging && 'opacity-50',
        isHighlighted && 'ring-2 ring-blue-500'
      )}
    >
      {/* Highlight badge */}
      {highlightInfo && (
        <div className="absolute -top-2 right-2 z-10">
          <span className="text-[10px] font-bold text-white bg-blue-500 rounded-full px-2 py-0.5">
            {highlightInfo.changer_name}が更新
          </span>
        </div>
      )}

      <button {...attributes} {...listeners} className="mt-1 cursor-grab text-muted-foreground/50 hover:text-muted-foreground touch-none">
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 space-y-1.5">
        {/* Contributor + Last updater */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="font-bold text-muted-foreground">投稿: {machine.contributor?.display_name ?? '不明'}</span>
          {machine.last_updater && (
            <span className="text-orange-500">最終更新: {machine.last_updater.display_name}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-bold min-w-[50px]">{machine.number}</span>
          <StatusPicker status={machine.status} onChange={onStatusChange} />
          <div className="flex-1" />
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
          <button onClick={onDelete} className="text-muted-foreground/50 hover:text-destructive transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

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
