'use client'

import type { DisplayTag } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StatusPickerProps {
  status: string
  tags: DisplayTag[]
  onChange: (status: string) => void
}

export function StatusPicker({ status, tags, onChange }: StatusPickerProps) {
  // 2行に分割: 偶数index→上段、奇数index→下段
  const topRow = tags.filter((_, i) => i % 2 === 0)
  const bottomRow = tags.filter((_, i) => i % 2 === 1)

  return (
    <div className="overflow-x-auto shrink-0">
      <div className="flex flex-col gap-1 p-1 bg-muted/40 rounded-lg">
        <div className="flex gap-1">
          {topRow.map(tag => (
            <TagButton key={tag.id} tag={tag} isActive={status === tag.label} onClick={() => onChange(tag.label)} />
          ))}
        </div>
        <div className="flex gap-1">
          {bottomRow.map(tag => (
            <TagButton key={tag.id} tag={tag} isActive={status === tag.label} onClick={() => onChange(tag.label)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function TagButton({ tag, isActive, onClick }: { tag: DisplayTag; isActive: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 flex items-center justify-center',
        isActive
          ? 'text-white ring-2 ring-offset-1 ring-offset-background shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
      style={isActive ? {
        backgroundColor: tag.color,
        '--tw-ring-color': tag.color,
      } as React.CSSProperties : undefined}
    >
      {tag.label}
    </button>
  )
}
