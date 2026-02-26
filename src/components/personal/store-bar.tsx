'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface StoreItem {
  id: string
  name: string
}

interface StoreBarProps {
  stores: StoreItem[]
  selectedStore: StoreItem | null
  onSelect: (store: StoreItem) => void
  onAddClick: () => void
  onDeleteClick: () => void
}

export function StoreBar({ stores, selectedStore, onSelect, onAddClick, onDeleteClick }: StoreBarProps) {
  return (
    <div className="flex items-center gap-2">
      <ScrollArea className="flex-1">
        <div className="flex gap-2 pb-1">
          {stores.map(store => (
            <button
              key={store.id}
              onClick={() => onSelect(store)}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                selectedStore?.id === store.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              )}
            >
              {store.name}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Button variant="outline" size="icon" className="shrink-0 h-8 w-8" onClick={onAddClick}>
        <Plus className="h-4 w-4" />
      </Button>
      {selectedStore && (
        <Button variant="outline" size="icon" className="shrink-0 h-8 w-8 text-destructive" onClick={onDeleteClick}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
