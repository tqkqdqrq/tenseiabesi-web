'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { useTheme } from 'next-themes'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Moon, Sun, LogOut, Sparkles, User, Users, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [secretCode, setSecretCode] = useState('')
  const [isActivating, setIsActivating] = useState(false)
  const [showModeHelp, setShowModeHelp] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('modeHelpSeen')
    if (!seen) {
      setShowModeHelp(true)
    }
  }, [])

  // profileが後から取得された場合にdisplayNameを同期
  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name)
    }
  }, [profile?.display_name])

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

  const handleActivateMembership = async () => {
    if (!user) return
    setIsActivating(true)
    try {
      const { data, error } = await (supabase.rpc as any)('activate_membership', { p_code: secretCode.trim() })
      if (error) throw error
      if (data?.success) {
        await refreshProfile()
        setSecretCode('')
        toast.success('塾メンバー認証が完了しました！')
      } else {
        toast.error(data?.error || 'コードが正しくありません')
      }
    } catch {
      toast.error('認証に失敗しました')
    }
    setIsActivating(false)
  }

  const handleLogout = async () => {
    await signOut()
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'エラーが発生しました')
      }
      await supabase.auth.signOut()
      router.push('/login')
    } catch (e: any) {
      toast.error(e.message || 'アカウント削除に失敗しました')
      setIsDeleting(false)
    }
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

        {/* Mode */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">使用モード</h2>
          <div className="flex gap-2">
            <Button
              variant={profile?.mode === 'personal' ? 'default' : 'outline'}
              size="sm"
              onClick={async () => {
                if (!user || profile?.mode === 'personal') return
                await supabase.from('profiles').update({ mode: 'personal' }).eq('id', user.id)
                await refreshProfile()
                toast.success('個人モードに切り替えました')
              }}
            >
              <User className="h-4 w-4 mr-1" />
              個人
            </Button>
            <Button
              variant={profile?.mode === 'group' ? 'default' : 'outline'}
              size="sm"
              onClick={async () => {
                if (!user || profile?.mode === 'group') return
                await supabase.from('profiles').update({ mode: 'group' }).eq('id', user.id)
                await refreshProfile()
                toast.success('グループモードに切り替えました')
              }}
            >
              <Users className="h-4 w-4 mr-1" />
              グループ
            </Button>
          </div>
        </div>

        <Separator />

        {/* Plan */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">塾メンバー限定</h2>
          {profile?.plan === 'pro' ? (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <Sparkles className="h-4 w-4" />
              塾メンバー 認証済み
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="member-code">メンバーコード</Label>
              <div className="flex gap-2">
                <Input
                  id="member-code"
                  type="text"
                  placeholder="コードを入力"
                  value={secretCode}
                  onChange={e => setSecretCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleActivateMembership()}
                />
                <Button
                  onClick={handleActivateMembership}
                  disabled={isActivating || !secretCode.trim()}
                >
                  {isActivating ? '処理中...' : '認証'}
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

        <Separator />

        {/* Delete Account */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
          </p>
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setShowDeleteAccount(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? '削除中...' : 'アカウントを削除'}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={showLogout}
        onOpenChange={setShowLogout}
        title="ログアウト"
        description="ログアウトしますか？"
        confirmLabel="ログアウト"
        onConfirm={handleLogout}
      />

      <ConfirmDialog
        open={showDeleteAccount}
        onOpenChange={setShowDeleteAccount}
        title="アカウント削除"
        description="本当にアカウントを削除しますか？すべてのデータが完全に削除され、この操作は元に戻せません。"
        confirmLabel="削除する"
        onConfirm={handleDeleteAccount}
      />

      <Dialog open={showModeHelp} onOpenChange={setShowModeHelp}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>使用モードについて</DialogTitle>
            <DialogDescription>
              「個人モード」と「グループモード」を切り替えることで、使わない機能をナビから非表示にできます。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 mt-0.5 shrink-0" />
              <p><span className="font-medium">個人モード</span> — 自分だけの台データを管理します。グループ機能は非表示になります。</p>
            </div>
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-0.5 shrink-0" />
              <p><span className="font-medium">グループモード</span> — チームで台データを共有します。個人機能は非表示になります。</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">この設定はいつでも変更できます。</p>
          <DialogFooter>
            <Button onClick={() => {
              localStorage.setItem('modeHelpSeen', '1')
              setShowModeHelp(false)
            }}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
