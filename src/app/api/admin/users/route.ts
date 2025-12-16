import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Service Role Key を使用してAdmin操作を行う（遅延初期化）
let supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment variables are not set')
    }
    supabaseAdmin = createClient(
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
  return supabaseAdmin
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, role, partner_id, store_id } = body

    // バリデーション
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'email, password, role are required' },
        { status: 400 }
      )
    }

    if (!['master', 'partner', 'store'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // ロールに応じた必須フィールドチェック
    if (role === 'partner' && !partner_id) {
      return NextResponse.json(
        { error: 'partner_id is required for partner role' },
        { status: 400 }
      )
    }

    if (role === 'store' && !store_id) {
      return NextResponse.json(
        { error: 'store_id is required for store role' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Supabase Auth でユーザー作成
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // メール確認をスキップ
      user_metadata: {
        name,
        role
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // user_profiles テーブルにプロファイルを作成
    // 空文字をnullに変換
    const validPartnerId = partner_id && partner_id.trim() !== '' ? partner_id : null
    const validStoreId = store_id && store_id.trim() !== '' ? store_id : null

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        name: name || email,
        role,
        partner_id: role === 'partner' ? validPartnerId : (role === 'store' ? validPartnerId : null),
        store_id: role === 'store' ? validStoreId : null
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      // ユーザーは作成されたがプロファイルが作成できなかった場合、ユーザーを削除
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role
      }
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    // 全ユーザープロファイルを取得
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        partners(name),
        stores(name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ users: data })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, role, partner_id, store_id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // 空文字をnullに変換
    const validPartnerId = partner_id && partner_id.trim() !== '' ? partner_id : null
    const validStoreId = store_id && store_id.trim() !== '' ? store_id : null

    // user_profiles を更新
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        name: name || null,
        role,
        partner_id: role === 'partner' ? validPartnerId : (role === 'store' ? validPartnerId : null),
        store_id: role === 'store' ? validStoreId : null
      })
      .eq('id', id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // user_profiles から削除（CASCADE で auth.users からも削除される）
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Profile delete error:', profileError)
    }

    // Auth からユーザーを削除
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Auth delete error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
