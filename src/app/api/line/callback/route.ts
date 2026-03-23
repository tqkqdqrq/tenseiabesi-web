import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // アプリのuser_id

  if (!code || !state) {
    return NextResponse.redirect(new URL('/settings?line=error', request.url))
  }

  try {
    // LINE Login でアクセストークンを取得
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${new URL(request.url).origin}/api/line/callback`,
        client_id: process.env.LINE_LOGIN_CHANNEL_ID!,
        client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET!,
      }),
    })

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text()
      console.error('LINE token error:', tokenRes.status, errBody)
      return NextResponse.redirect(new URL('/settings?line=error&step=token', request.url))
    }

    const tokenData = await tokenRes.json()

    // LINE Profile API でユーザーIDを取得
    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    if (!profileRes.ok) {
      const errBody = await profileRes.text()
      console.error('LINE profile error:', profileRes.status, errBody)
      return NextResponse.redirect(new URL('/settings?line=error&step=profile', request.url))
    }

    const lineProfile = await profileRes.json()

    // 友だち登録チェック（Messaging API Bot Profile）
    let lineFollowed = false
    try {
      const botProfileRes = await fetch(
        `https://api.line.me/v2/bot/profile/${lineProfile.userId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.LINE_MESSAGING_CHANNEL_TOKEN}`,
          },
        }
      )
      lineFollowed = botProfileRes.ok
    } catch {
      // ネットワークエラー時はfalseのまま
    }

    // Service role clientでprofilesを更新（RLSをバイパス）
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: dbError } = await supabase
      .from('profiles')
      .update({ line_user_id: lineProfile.userId, line_followed: lineFollowed })
      .eq('id', state)

    if (dbError) {
      console.error('DB update error:', dbError)
      return NextResponse.redirect(new URL('/settings?line=error&step=db', request.url))
    }

    if (lineFollowed) {
      return NextResponse.redirect(new URL('/settings?line=success', request.url))
    } else {
      return NextResponse.redirect(new URL('/settings?line=need_follow', request.url))
    }
  } catch (e) {
    console.error('LINE callback error:', e)
    return NextResponse.redirect(new URL('/settings?line=error&step=catch', request.url))
  }
}
