import { createServerComponentClient } from './supabase-server'

export type AuthResult = {
  authenticated: boolean
  userId?: string
  role?: string
  error?: string
}

/**
 * API エンドポイントでの認証チェック
 * masterロールのユーザーのみアクセス可能
 */
export async function verifyAdminAuth(): Promise<AuthResult> {
  try {
    const supabase = await createServerComponentClient()

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return {
        authenticated: false,
        error: '認証が必要です'
      }
    }

    // ユーザープロファイルを取得してロールを確認
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile) {
      return {
        authenticated: false,
        error: 'プロファイルが見つかりません'
      }
    }

    // masterロールのみ許可
    if (profile.role !== 'master') {
      return {
        authenticated: false,
        error: 'この操作には管理者権限が必要です'
      }
    }

    return {
      authenticated: true,
      userId: session.user.id,
      role: profile.role
    }
  } catch {
    return {
      authenticated: false,
      error: '認証処理中にエラーが発生しました'
    }
  }
}

/**
 * パスワード強度チェック
 * - 最低8文字
 * - 英字と数字の両方を含む
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('パスワードは8文字以上必要です')
  }

  // 英字（大文字または小文字）を含むかチェック
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('英字を1文字以上含めてください')
  }

  // 数字を含むかチェック
  if (!/[0-9]/.test(password)) {
    errors.push('数字を1文字以上含めてください')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * メールアドレスの形式チェック
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
