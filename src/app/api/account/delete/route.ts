import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function DELETE() {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: '認証されていません' }, { status: 401 })
  }

  const admin = getSupabaseAdmin()
  const { error } = await admin.auth.admin.deleteUser(user.id)

  if (error) {
    console.error('Account deletion failed:', error.message)
    return NextResponse.json({ error: 'アカウント削除に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
