'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface JoinGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onJoin: (code: string) => Promise<void>
  error?: string | null
  success?: string | null
}

export function JoinGroupDialog({ open, onOpenChange, onJoin, error, success }: JoinGroupDialogProps) {
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setIsSubmitting(true)
    await onJoin(code.trim())
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>グループに参加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <div className="space-y-2">
            <Label htmlFor="invite-code">招待コード</Label>
            <Input
              id="invite-code"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="8桁の招待コード"
              maxLength={8}
              className="font-mono tracking-widest text-center text-lg"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={code.trim().length < 8 || isSubmitting}>
              参加申請
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
