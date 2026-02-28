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
  const [countText, setCountText] = useState(machine.first_hit_count === 0 ? '' : String(machine.first_hit_count))
  const [memoText, setMemoText] = useState(machine.memo)
  const countRef = useRef<HTMLInputElement>(null)
  const memoRef = useRef<HTMLInputElement>(null)
  const isHighlighted = !!highlightInfo

  useEffect(() => {
    if (document.activeElement !== countRef.current) {
      setCountText(machine.first_hit_count === 0 ? '' : String(machine.first_hit_count))
    }
  }, [machine.first_hit_count])

  useEffect(() => {
    if (document.activeElement !== memoRef.current) {
      setMemoText(machine.memo)
    }
  }, [machine.memo])

  const commitCount = () => {
    if (countText === '') return
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

      <button {...attributes} {...listeners} className="mt-1 cursor-grab text-muted-foreground/50 hover:text-muted-foreground touch-none p-1">
        <GripVertical className="h-6 w-6" />
      </button>

      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Contributor + Last updater */}
        <div className="flex items-center gap-2 text-[10px] -mb-1">
          <span className="font-bold text-muted-foreground">投稿: {machine.contributor?.display_name ?? '不明'}</span>
          {machine.last_updater && (
            <span className="text-orange-500">最終更新: {machine.last_updater.display_name}</span>
          )}
        </div>

        {/* Top Row: Machine Number + Memo + Delete */}
        <div className="flex items-center gap-2">
          {/* Machine number */}
          <span className="font-mono text-xl font-black min-w-[50px] tracking-tight shrink-0">{machine.number}</span>

          {/* Memo */}
          <input
            ref={memoRef}
            value={memoText}
            onChange={e => setMemoText(e.target.value)}
            onBlur={commitMemo}
            onKeyDown={e => e.key === 'Enter' && commitMemo()}
            placeholder="メモ"
            className="flex-1 bg-muted/40 hover:bg-muted/60 focus:bg-muted/80 rounded-md px-3 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/40 transition-colors min-w-0"
          />

          {/* Delete */}
          <button onClick={onDelete} className="p-1.5 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors shrink-0">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom Row: StatusPicker (Left) | Hit Counter (Right) */}
        <div className="flex items-end justify-between gap-3">
          {/* Status */}
          <StatusPicker status={machine.status} onChange={onStatusChange} />

          {/* First hit count */}
          <div className="flex flex-col items-center gap-1.5 bg-muted/20 p-1.5 rounded-xl border border-border/40 shadow-sm grow sm:grow-0 max-w-[180px]">
            <span className="text-[11px] font-bold text-muted-foreground tracking-wider">初当: {countText || '0'}</span>
            <div className="flex items-center bg-background rounded-lg shadow-sm border border-border/50 w-full overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  const current = parseInt(countText) || 0
                  if (current > 0) {
                    const next = current - 1
                    setCountText(next === 0 ? '' : String(next))
                    onCountChange(next)
                  }
                }}
                className="h-9 sm:h-10 flex-1 hover:bg-muted flex items-center justify-center text-xl font-medium active:bg-muted/80 transition-colors"
              >
                −
              </button>
              <div className="w-[1px] h-6 bg-border/50 shrink-0" />
              <input
                ref={countRef}
                type="number"
                inputMode="numeric"
                min="0"
                value={countText}
                onChange={e => setCountText(e.target.value)}
                onBlur={commitCount}
                onKeyDown={e => e.key === 'Enter' && commitCount()}
                placeholder="入力"
                className="h-9 sm:h-10 w-14 sm:w-16 bg-transparent text-center font-mono text-xs sm:text-sm font-semibold outline-none placeholder:text-[10px]"
              />
              <div className="w-[1px] h-6 bg-border/50 shrink-0" />
              <button
                type="button"
                onClick={() => {
                  const current = parseInt(countText) || 0
                  const next = current + 1
                  setCountText(String(next))
                  onCountChange(next)
                }}
                className="h-9 sm:h-10 flex-1 hover:bg-muted flex items-center justify-center text-xl font-medium active:bg-muted/80 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
