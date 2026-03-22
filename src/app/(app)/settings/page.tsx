'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useTheme } from 'next-themes'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Moon, Sun, LogOut, Sparkles, User, Users, MessageCircle } from 'lucide-react'
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
  const [showModeHelp, setShowModeHelp] = useState(false)
  const [showUnlinkLine, setShowUnlinkLine] = useState(false)

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

  // LINE連携コールバック結果の処理
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const lineResult = params.get('line')
    if (lineResult === 'success') {
      refreshProfile()
      toast.success('LINE連携が完了しました')
      window.history.replaceState({}, '', '/settings')
    } else if (lineResult === 'error') {
      toast.error('LINE連携に失敗しました')
      window.history.replaceState({}, '', '/settings')
    }
  }, [refreshProfile])

  const handleLinkLine = () => {
    if (!user) return
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID!,
      redirect_uri: `${window.location.origin}/api/line/callback`,
      state: user.id,
      scope: 'profile openid',
    })
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params}`
  }

  const handleUnlinkLine = async () => {
    if (!user) return
    await supabase.from('profiles').update({ line_user_id: null }).eq('id', user.id)
    await refreshProfile()
    toast.success('LINE連携を解除しました')
  }

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

        {/* LINE */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">LINE連携</h2>
          {profile?.line_user_id ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                <MessageCircle className="h-4 w-4" />
                LINE連携済み
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowUnlinkLine(true)}>
                連携を解除
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">LINEと連携すると、グループメンバーからの台通知をLINEで受け取れます。</p>
              <Button onClick={handleLinkLine} className="bg-[#06C755] hover:bg-[#05b34d] text-white">
                <MessageCircle className="h-4 w-4 mr-2" />
                LINEと連携する
              </Button>
            </div>
          )}
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
        open={showUnlinkLine}
        onOpenChange={setShowUnlinkLine}
        title="LINE連携解除"
        description="LINE連携を解除しますか？グループからのLINE通知が届かなくなります。"
        confirmLabel="解除"
        onConfirm={handleUnlinkLine}
      />
      <ConfirmDialog
        open={showLogout}
        onOpenChange={setShowLogout}
        title="ログアウト"
        description="ログアウトしますか？"
        confirmLabel="ログアウト"
        onConfirm={handleLogout}
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
