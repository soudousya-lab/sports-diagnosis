import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
