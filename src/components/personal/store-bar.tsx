'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
      <Select
        value={selectedStore?.id ?? ''}
        onValueChange={(id) => {
          const store = stores.find(s => s.id === id)
          if (store) onSelect(store)
        }}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="店舗を選択" />
        </SelectTrigger>
        <SelectContent>
          {stores.map(store => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
