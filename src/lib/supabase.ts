import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Cookieドメインを取得（サブドメイン間で共有するため）
function getCookieDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined

  const hostname = window.location.hostname
  // localhost や IP アドレスの場合はドメイン指定しない
  if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return undefined
  }

  // サブドメインがある場合、親ドメインを返す（例: test.nobishiro.kids → .nobishiro.kids）
  const parts = hostname.split('.')
  if (parts.length >= 2) {
    // 最後の2つのパーツを取得（nobishiro.kids）
    return '.' + parts.slice(-2).join('.')
  }

  return undefined
}

// シングルトンパターンでクライアントを管理（Multiple GoTrueClient警告を防ぐ）
let supabaseInstance: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // サーバーサイドでは毎回新しいインスタンスを作成（SSRでは問題なし）
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables are missing:', { url: !!supabaseUrl, key: !!supabaseAnonKey })
      throw new Error('Supabase configuration is missing')
    }

    const cookieDomain = getCookieDomain()

    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookieOptions: {
        // Cookieドメインを設定してサブドメイン間で共有
        domain: cookieDomain,
        path: '/',
        sameSite: 'lax',
        secure: true
      }
    })
  }
  return supabaseInstance
}

// Proxyを使って遅延初期化（後方互換性のため）
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient]
  }
})

// ブラウザ用Supabaseクライアント（認証セッション対応）
export function createClientComponentClient(): SupabaseClient {
  return getSupabaseClient()
}

// 型定義
export type Store = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  line_qr_url: string | null
  address: string | null
  phone: string | null
  hours: string | null
  theme_color: string
  partner_id: string | null
  created_at: string
  updated_at: string
}

export type Child = {
  id: string
  store_id: string
  name: string
  furigana: string | null
  birthdate: string | null
  gender: 'male' | 'female'
  grade: string
  height: number | null
  weight: number | null
  created_at: string
  updated_at: string
}

export type Measurement = {
  id: string
  child_id: string
  store_id: string
  measured_at: string
  mode: 'simple' | 'detail'
  grip_right: number | null
  grip_left: number | null
  jump: number | null
  dash: number | null
  doublejump: number | null
  squat: number | null
  sidestep: number | null
  throw: number | null
  created_at: string
}

export type Result = {
  id: string
  measurement_id: string
  motor_age: number
  motor_age_diff: number
  type_name: string
  type_description: string
  class_level: 'beginner' | 'standard' | 'expert'
  weakness_class: string | null
  scores: Record<string, number>
  recommended_sports: Array<{
    name: string
    icon: string
    aptitude: number
  }>
  recommended_trainings: Array<{
    name: string
    desc: string
    reps: string
    effect: string
    category: string
    priority: string
  }>
  goals: Record<string, number>
  created_at: string
}

export type Training = {
  id: string
  ability_key: string
  age_group: 'young' | 'old'
  name: string
  description: string | null
  reps: string | null
  effect: string | null
  sort_order: number
}

// マルチテナント用型定義
export type UserRole = 'master' | 'partner' | 'store'

export type Partner = {
  id: string
  name: string
  email: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export type UserProfile = {
  id: string
  email: string
  name: string | null
  role: UserRole
  partner_id: string | null
  store_id: string | null
  created_at: string
  updated_at: string
}

// ストア拡張型（partner_id追加）
export type StoreWithPartner = Store & {
  partner_id: string | null
  partner?: Partner | null
}

// 統計ビュー用型定義
export type StoreStatistics = {
  store_id: string
  store_name: string
  slug: string
  partner_id: string | null
  partner_name: string | null
  children_count: number
  measurements_count: number
  first_measurement_date: string | null
  last_measurement_date: string | null
}

export type GradeGenderDistribution = {
  store_id: string
  grade: string
  gender: 'male' | 'female'
  count: number
}

export type MonthlyMeasurement = {
  store_id: string
  month: string
  measurement_count: number
}

export type WeaknessStatistic = {
  store_id: string
  weakness_class: string
  count: number
}
