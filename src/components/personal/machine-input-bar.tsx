'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, RotateCcw } from 'lucide-react'

interface MachineInputBarProps {
  onAdd: (number: string) => void
  onReset: () => void
  disabled?: boolean
}

export function MachineInputBar({ onAdd, onReset, disabled }: MachineInputBarProps) {
  const [number, setNumber] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!number.trim()) return
    onAdd(number.trim())
    setNumber('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={number}
        onChange={e => setNumber(e.target.value)}
        placeholder="台番号を入力"
        className="flex-1"
        disabled={disabled}
      />
      <Button type="submit" size="icon" className="shrink-0" disabled={disabled || !number.trim()}>
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="shrink-0"
        onClick={onReset}
        disabled={disabled}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </form>
  )
}
