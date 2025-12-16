import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerComponentClient(cookieStore)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const storeId = formData.get('storeId') as string
    const qrType = formData.get('qrType') as 'line' | 'reservation'

    if (!file || !storeId || !qrType) {
      return NextResponse.json(
        { error: '必要なパラメータが不足しています' },
        { status: 400 }
      )
    }

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      )
    }

    // ファイル形式チェック
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '対応していないファイル形式です（PNG, JPEG, GIF, WebPのみ）' },
        { status: 400 }
      )
    }

    // ファイル名を生成（store_id + qr_type + timestamp）
    const fileExt = file.name.split('.').pop()
    const fileName = `${storeId}/${qrType}_${Date.now()}.${fileExt}`

    // ArrayBufferに変換
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Supabase Storageにアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('qr-codes')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: `アップロードに失敗しました: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('qr-codes')
      .getPublicUrl(fileName)

    // storesテーブルを更新
    const updateField = qrType === 'line' ? 'line_qr_url' : 'reservation_qr_url'
    const { error: updateError } = await supabase
      .from('stores')
      .update({ [updateField]: publicUrl })
      .eq('id', storeId)

    if (updateError) {
      console.error('Store update error:', updateError)
      return NextResponse.json(
        { error: `店舗情報の更新に失敗しました: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      qrType
    })

  } catch (error) {
    console.error('QR upload error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
