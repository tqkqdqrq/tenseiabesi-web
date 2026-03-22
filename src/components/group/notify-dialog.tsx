'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface NotifyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  machineNumber: string
  storeName: string
  groupId: string
}

const MESSAGE_TYPES = [
  { value: 'vacant', label: '台空き', emoji: '🟢' },
  { value: 'status', label: '現状共有', emoji: '📊' },
  { value: 'caution', label: '要注意', emoji: '⚠️' },
  { value: 'custom', label: 'カスタム', emoji: '✏️' },
] as const

export function NotifyDialog({ open, onOpenChange, machineNumber, storeName, groupId }: NotifyDialogProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [customMessage, setCustomMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    if (!selectedType) return
    if (selectedType === 'custom' && !customMessage.trim()) return

    setIsSending(true)
    try {
      const res = await fetch('/api/line/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          machineNumber,
          storeName,
          messageType: selectedType,
          customMessage: selectedType === 'custom' ? customMessage.trim() : undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        const remainingText = data.remaining !== undefined ? `（残り${data.remaining}回）` : ''
        toast.success(`${data.sentTo}人に通知を送信しました${remainingText}`)
        onOpenChange(false)
        setSelectedType(null)
        setCustomMessage('')
      } else {
        toast.error(data.error || '通知の送信に失敗しました')
      }
    } catch {
      toast.error('通知の送信に失敗しました')
    }
    setIsSending(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>LINE通知 - 台番号{machineNumber}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {MESSAGE_TYPES.map(type => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? 'default' : 'outline'}
              className="h-12"
              onClick={() => setSelectedType(type.value)}
            >
              {type.emoji} {type.label}
            </Button>
          ))}
        </div>

        {selectedType === 'custom' && (
          <Input
            placeholder="メッセージを入力"
            value={customMessage}
            onChange={e => setCustomMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
        )}

        <DialogFooter>
          <Button
            onClick={handleSend}
            disabled={isSending || !selectedType || (selectedType === 'custom' && !customMessage.trim())}
            className="w-full"
          >
            {isSending ? '送信中...' : '送信'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
