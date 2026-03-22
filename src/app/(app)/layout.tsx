'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { BottomNav } from '@/components/layout/bottom-nav'
import { AppSidebar } from '@/components/layout/app-sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, user, profile } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

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
    </div>
  )
}
