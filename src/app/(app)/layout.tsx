'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { BottomNav } from '@/components/layout/bottom-nav'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Skeleton } from '@/components/ui/skeleton'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-32" />
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
