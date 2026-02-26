'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Copy, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface InviteCodeDisplayProps {
  inviteCode: string
  groupName: string
}

export function InviteCodeDisplay({ inviteCode, groupName }: InviteCodeDisplayProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteCode)
    toast.success('招待コードをコピーしました')
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${groupName} - 転生あべし`,
        text: `招待コード: ${inviteCode}`,
      })
    } else {
      handleCopy()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="bg-white p-4 rounded-xl">
        <QRCodeSVG value={inviteCode} size={160} />
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">招待コード</p>
        <p className="font-mono text-2xl font-bold tracking-[0.3em]">{inviteCode}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-1" />
          コピー
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-1" />
          シェア
        </Button>
      </div>
    </div>
  )
}
