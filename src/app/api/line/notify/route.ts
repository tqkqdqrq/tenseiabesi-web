import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

interface NotifyRequest {
  groupId: string
  machineNumber: string
  storeName: string
  messageType: string
  customMessage?: string
}

const MESSAGE_LABELS: Record<string, string> = {
  vacant: '台空き',
  status: '現状共有',
  caution: '要注意',
  custom: 'カスタム',
}

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body: NotifyRequest = await request.json()
    const { groupId, machineNumber, storeName, messageType, customMessage } = body

    if (!groupId || !machineNumber || !storeName || !messageType) {
      return NextResponse.json({ error: 'パラメータが不足しています' }, { status: 400 })
    }

    // 送信者のプロフィールを取得
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('display_name, plan')
      .eq('id', user.id)
      .single()

    // 通知回数制限チェック
    const dailyLimit = senderProfile?.plan === 'pro' ? 10 : 3
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // Service role clientでDB操作（RLSバイパス）
    const adminSupabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { count: todayCount } = await adminSupabase
      .from('line_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())

    if ((todayCount ?? 0) >= dailyLimit) {
      return NextResponse.json(
        { error: `本日の通知上限に達しました（${senderProfile?.plan === 'pro' ? 'Pro: 10回' : 'Free: 3回'}/日）` },
        { status: 429 }
      )
    }

    // グループメンバーのLINE IDを取得
    const { data: members } = await adminSupabase
      .from('group_members')
      .select('user_id, profiles:user_id(line_user_id)')
      .eq('group_id', groupId)
      .eq('status', 'approved')
      // テスト時は自分にも送信するため、neqをコメントアウト
      // .neq('user_id', user.id)

    if (!members || members.length === 0) {
      return NextResponse.json({ error: '通知先のメンバーがいません' }, { status: 404 })
    }

    // LINE user IDを収集（連携済みのメンバーのみ）
    const lineUserIds = members
      .map(m => {
        const profile = m.profiles as unknown as { line_user_id: string | null } | null
        return profile?.line_user_id
      })
      .filter((id): id is string => !!id)

    if (lineUserIds.length === 0) {
      return NextResponse.json({ error: 'LINE連携済みのメンバーがいません' }, { status: 404 })
    }

    // メッセージ構築
    const label = MESSAGE_LABELS[messageType] ?? messageType
    const senderName = senderProfile?.display_name ?? '不明'
    let messageText = `🎰 ${storeName} - 台番号${machineNumber}\n📢 ${label}`
    if (messageType === 'custom' && customMessage) {
      messageText += `\n💬 ${customMessage}`
    }
    messageText += `\n👤 ${senderName}`

    // LINE Messaging API で送信
    const lineRes = await fetch('https://api.line.me/v2/bot/message/multicast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LINE_MESSAGING_CHANNEL_TOKEN}`,
      },
      body: JSON.stringify({
        to: lineUserIds,
        messages: [{ type: 'text', text: messageText }],
      }),
    })

    if (!lineRes.ok) {
      const errorData = await lineRes.text()
      console.error('LINE API error:', errorData)
      return NextResponse.json({ error: 'LINE送信に失敗しました' }, { status: 500 })
    }

    // 通知回数を記録
    await adminSupabase
      .from('line_notifications')
      .insert({ user_id: user.id, group_id: groupId })

    const remaining = dailyLimit - (todayCount ?? 0) - 1
    return NextResponse.json({ success: true, sentTo: lineUserIds.length, remaining })
  } catch (error) {
    console.error('Notify error:', error)
    return NextResponse.json({ error: '通知の送信に失敗しました' }, { status: 500 })
  }
}
