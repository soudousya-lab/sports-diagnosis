import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'

// Service Role Key を使用してAdmin操作を行う
function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables are not set')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// パスワード変更
export async function PUT(request: Request) {
  try {
    // 現在のユーザーを取得
    const cookieStore = await cookies()
    const supabase = createServerComponentClient(cookieStore)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, currentPassword, newPassword, newEmail } = body

    // 現在のパスワードで認証確認
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || '',
      password: currentPassword
    })

    if (signInError) {
      return NextResponse.json(
        { error: '現在のパスワードが正しくありません' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    if (action === 'password') {
      // パスワード変更
      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json(
          { error: 'パスワードは8文字以上で入力してください' },
          { status: 400 }
        )
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      )

      if (updateError) {
        console.error('Password update error:', updateError)
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        )
      }

      return NextResponse.json({ success: true, message: 'パスワードを変更しました' })

    } else if (action === 'email') {
      // メールアドレス変更
      if (!newEmail) {
        return NextResponse.json(
          { error: '新しいメールアドレスを入力してください' },
          { status: 400 }
        )
      }

      // メールアドレス形式チェック
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newEmail)) {
        return NextResponse.json(
          { error: 'メールアドレスの形式が正しくありません' },
          { status: 400 }
        )
      }

      if (newEmail === user.email) {
        return NextResponse.json(
          { error: '現在と同じメールアドレスです' },
          { status: 400 }
        )
      }

      // Supabase Auth のメールアドレスを更新（確認メールなしで即時反映）
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { email: newEmail, email_confirm: true }
      )

      if (authUpdateError) {
        console.error('Auth email update error:', authUpdateError)
        return NextResponse.json(
          { error: authUpdateError.message },
          { status: 400 }
        )
      }

      // user_profiles のメールアドレスも更新
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .update({ email: newEmail })
        .eq('id', user.id)

      if (profileError) {
        console.error('Profile email update error:', profileError)
        // Auth側は更新されているので警告のみ
      }

      return NextResponse.json({
        success: true,
        message: 'メールアドレスを変更しました。次回ログインから新しいメールアドレスを使用してください。',
        newEmail
      })

    } else {
      return NextResponse.json(
        { error: '無効なアクションです' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Account update error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
