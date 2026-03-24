'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { BottomNav } from '@/components/layout/bottom-nav'
import { GlobalPresenceProvider } from '@/components/providers/global-presence-provider'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Users, MessageCircle } from 'lucide-react'

const UPDATE_VERSION = 'v2024-03-24'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, user, profile } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  // 更新お知らせ表示
  useEffect(() => {
    if (!user) return
    const seen = localStorage.getItem('updateSeen')
    if (seen !== UPDATE_VERSION) {
      setShowUpdate(true)
    }
  }, [user])

  const handleDismissUpdate = () => {
    localStorage.setItem('updateSeen', UPDATE_VERSION)
    setShowUpdate(false)
  }

  // モードに応じたリダイレクト
  useEffect(() => {
    if (!profile?.mode || pathname === '/settings') return
    if (profile.mode === 'group' && pathname.startsWith('/personal')) {
      router.replace('/groups')
    } else if (profile.mode === 'personal' && pathname.startsWith('/groups')) {
      router.replace('/personal')
    }
  }, [profile?.mode, pathname, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  return (
    <GlobalPresenceProvider>
    <div className="min-h-screen flex overflow-x-hidden max-w-[100vw]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:border-r bg-card">
        <AppSidebar />
      </aside>
      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0 overflow-x-hidden min-w-0">
        {children}
      </main>
      {/* Mobile bottom nav */}
      <BottomNav />

      {/* 更新お知らせダイアログ */}
      <Dialog open={showUpdate} onOpenChange={v => { if (!v) handleDismissUpdate() }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">アップデートのお知らせ</DialogTitle>
            <DialogDescription className="sr-only">新機能のお知らせ</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">個人 / グループモード切替</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  設定画面からモードを切り替えられます。個人モードで自分だけのデータ管理、グループモードでメンバーとリアルタイム共有が可能です。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">LINE通知連携</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  設定画面からLINEアカウントを連携すると、グループメンバーからの台情報通知をLINEで受け取れます。通知を受け取るにはLINE連携に加え、公式アカウントの友だち追加も必要です。どちらも設定画面から行えます。
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleDismissUpdate} className="w-full">OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </GlobalPresenceProvider>
  )
}
