-- QRコードストレージ機能追加

-- 1. storesテーブルにreservation_qr_urlカラムを追加
ALTER TABLE stores ADD COLUMN IF NOT EXISTS reservation_qr_url TEXT;

-- 2. ストレージバケット作成（Supabase Storageを使用）
-- 注意: この部分はSupabaseダッシュボードまたはSupabase CLIで実行する必要があります
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('qr-codes', 'qr-codes', true)
-- ON CONFLICT (id) DO NOTHING;

-- 3. ストレージポリシー（Supabaseダッシュボードで設定）
-- - 認証ユーザーのみアップロード可能
-- - 公開読み取り可能

-- 4. stores更新ポリシーを追加（QRコードURL更新用）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update store qr urls' AND tablename = 'stores'
  ) THEN
    CREATE POLICY "Anyone can update store qr urls" ON stores
      FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;
