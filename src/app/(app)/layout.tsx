'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { BottomNav } from '@/components/layout/bottom-nav'
import { AppSidebar } from '@/components/layout/app-sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:border-r bg-card">
        <AppSidebar />
      </aside>
      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
        {children}
      </main>
      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
