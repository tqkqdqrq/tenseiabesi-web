'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Users, Settings, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/auth-provider'

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { profile } = useAuth()
  const [groupHref, setGroupHref] = useState('/groups')

  useEffect(() => {
    const lastGroupId = localStorage.getItem('lastGroupId')
    if (lastGroupId) {
      setGroupHref(`/groups/${lastGroupId}`)
    }
  }, [pathname])

  const allNavItems = [
    { href: '/personal', label: '個人モード', icon: User, mode: 'personal' as const },
    { href: groupHref, label: 'グループ', icon: Users, mode: 'group' as const },
    { href: '/settings', label: '設定', icon: Settings, mode: null },
  ]

  const navItems = allNavItems.filter(item => item.mode === null || item.mode === profile?.mode)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-lg font-bold">転生あべし</h1>
        <p className="text-xs text-muted-foreground">パチスロ台データ記録</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(item => {
          const isActive = item.icon === Users
            ? pathname.startsWith('/groups')
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'ライトモード' : 'ダークモード'}
        </Button>
      </div>
    </div>
  )
}
