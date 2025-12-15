// masterユーザー作成スクリプト
// 実行: npx tsx scripts/create-master-user.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY が設定されていません')
  console.log('\n.env.local に以下を追加してください:')
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  console.log('\nService Role Key は Supabase Dashboard → Settings → API で確認できます')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createMasterUser() {
  const email = 'soudousya@gmail.com'
  const password = 'y1u3m9a0'
  const name = '岡田'

  console.log('Creating master user...')

  // 1. ユーザーを作成
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: 'master' }
  })

  if (userError) {
    console.error('ユーザー作成エラー:', userError.message)
    return
  }

  console.log('User created:', userData.user?.id)

  // 2. user_profilesにmasterロールを設定
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      id: userData.user!.id,
      email,
      name,
      role: 'master'
    })

  if (profileError) {
    console.error('プロファイル作成エラー:', profileError.message)
    return
  }

  console.log('\n✅ Master user created successfully!')
  console.log('Email:', email)
  console.log('Password:', password)
  console.log('\nhttp://localhost:3000/admin/login でログインしてください')
}

createMasterUser()
