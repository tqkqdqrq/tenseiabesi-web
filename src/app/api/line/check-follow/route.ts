import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const adminSupabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('line_user_id')
      .eq('id', user.id)
      .single()

    if (!profile?.line_user_id) {
      return NextResponse.json({ error: 'LINE未連携です' }, { status: 400 })
    }

    // Bot Profile APIで友だち状態を確認
    const botProfileRes = await fetch(
      `https://api.line.me/v2/bot/profile/${profile.line_user_id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LINE_MESSAGING_CHANNEL_TOKEN}`,
        },
      }
    )

    const followed = botProfileRes.ok

    await adminSupabase
      .from('profiles')
      .update({ line_followed: followed })
      .eq('id', user.id)

    return NextResponse.json({ followed })
  } catch (error) {
    console.error('Check follow error:', error)
    return NextResponse.json({ error: '確認に失敗しました' }, { status: 500 })
  }
}
