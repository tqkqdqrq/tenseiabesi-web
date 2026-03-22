import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // タイムアウト付きでauth.getUser()を呼ぶ（5秒でタイムアウト）
  let user = null
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      ),
    ])
    user = result.data.user
  } catch {
    // タイムアウトまたはエラー → 未認証として続行
    user = null
  }

  const pathname = request.nextUrl.pathname

  // Unauthenticated users: redirect to landing page (root)
  if (!user && !pathname.startsWith("/login") && !pathname.startsWith("/signup") && !pathname.startsWith("/landing") && pathname !== "/") {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated users accessing auth pages get redirected to /personal
  if (user && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/personal'
    return NextResponse.redirect(url)
  }

  // Unauthenticated root → landing
  if (!user && pathname === "/") {
    const url = request.nextUrl.clone()
    url.pathname = "/landing"
    return NextResponse.redirect(url)
  }

  // Root redirect
  if (user && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/personal'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
