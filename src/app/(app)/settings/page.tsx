'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useTheme } from 'next-themes'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Moon, Sun, LogOut, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const supabase = getSupabaseBrowserClient()

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [secretCode, setSecretCode] = useState('')
  const [isActivating, setIsActivating] = useState(false)

  const handleSaveName = async () => {
    const trimmed = displayName.trim()
    if (!trimmed || !user) return
    setIsSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: trimmed })
      .eq('id', user.id)
    if (error) {
      toast.error('表示名の更新に失敗しました')
    } else {
      await refreshProfile()
      toast.success('表示名を更新しました')
    }
    setIsSaving(false)
  }

  const handleActivatePro = async () => {
    if (!user) return
    if (secretCode !== 'Tensei20260225') {
      toast.error('コードが正しくありません')
      return
    }
    setIsActivating(true)
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ plan: 'pro' })
        .eq('id', user.id)
      if (profileError) throw profileError

      const { error: groupsError } = await supabase
        .from('groups')
        .update({ max_members: 999 })
        .eq('leader_id', user.id)
      if (groupsError) throw groupsError

      await refreshProfile()
      setSecretCode('')
      toast.success('Pro版を解放しました！')
    } catch {
      toast.error('Pro版の解放に失敗しました')
    }
    setIsActivating(false)
  }

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <h1 className="text-lg font-bold">設定</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-lg mx-auto w-full">
        {/* Profile */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">プロフィール</h2>
          <div className="space-y-2">
            <Label htmlFor="display-name">表示名</Label>
            <div className="flex gap-2">
              <Input
                id="display-name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              />
              <Button
                onClick={handleSaveName}
                disabled={isSaving || displayName.trim() === profile?.display_name}
              >
                保存
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>メールアドレス</Label>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Separator />

        {/* Theme */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">テーマ</h2>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
            >
              <Sun className="h-4 w-4 mr-1" />
              ライト
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-4 w-4 mr-1" />
              ダーク
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
            >
              システム
            </Button>
          </div>
        </div>

        <Separator />

        {/* Plan */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">プラン</h2>
          {profile?.plan === 'pro' ? (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <Sparkles className="h-4 w-4" />
              Pro版 解放済み
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="secret-code">ヒミツのコード</Label>
              <div className="flex gap-2">
                <Input
                  id="secret-code"
                  type="text"
                  placeholder="コードを入力"
                  value={secretCode}
                  onChange={e => setSecretCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleActivatePro()}
                />
                <Button
                  onClick={handleActivatePro}
                  disabled={isActivating || !secretCode.trim()}
                >
                  {isActivating ? '処理中...' : '解放'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Logout */}
        <Button variant="destructive" className="w-full" onClick={() => setShowLogout(true)}>
          <LogOut className="h-4 w-4 mr-2" />
          ログアウト
        </Button>
      </div>

      <ConfirmDialog
        open={showLogout}
        onOpenChange={setShowLogout}
        title="ログアウト"
        description="ログアウトしますか？"
        confirmLabel="ログアウト"
        onConfirm={handleLogout}
      />
    </div>
  )
}
