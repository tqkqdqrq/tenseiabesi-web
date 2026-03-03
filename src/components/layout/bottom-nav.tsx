'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()
  const [groupHref, setGroupHref] = useState('/groups')
  const [visible, setVisible] = useState(true)
  const touchStartY = useRef(0)

  useEffect(() => {
    const lastGroupId = localStorage.getItem('lastGroupId')
    if (lastGroupId) {
      setGroupHref(`/groups/${lastGroupId}`)
    }
  }, [pathname])

  // Show on page change
  useEffect(() => {
    setVisible(true)
  }, [pathname])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const delta = e.touches[0].clientY - touchStartY.current
    if (Math.abs(delta) < 10) return
    // delta > 0 = finger moves down = scroll up → show
    // delta < 0 = finger moves up = scroll down → hide
    setVisible(delta > 0)
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    if (Math.abs(e.deltaY) < 5) return
    // deltaY > 0 = scroll down → hide, deltaY < 0 = scroll up → show
    setVisible(e.deltaY < 0)
  }, [])

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('wheel', handleWheel, { passive: true })
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('wheel', handleWheel)
    }
  }, [handleTouchStart, handleTouchMove, handleWheel])

  const navItems = [
    { href: '/personal', label: '個人', icon: User },
    { href: groupHref, label: 'グループ', icon: Users },
    { href: '/settings', label: '設定', icon: Settings },
  ]

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden transition-transform duration-300',
        visible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="flex h-16 items-center justify-around">
        {navItems.map(item => {
          const isActive = item.icon === Users
            ? pathname.startsWith('/groups')
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
