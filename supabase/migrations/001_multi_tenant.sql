-- マルチテナント化: パートナー・ユーザー管理スキーマ
-- 実行前に Supabase ダッシュボードで Authentication を有効化しておくこと

-- ============================================
-- 1. パートナー（販売代理者）テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. stores テーブルに partner_id を追加
-- ============================================
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_stores_partner ON stores(partner_id);

-- ============================================
-- 3. ユーザープロファイルテーブル（auth.usersと連携）
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(20) NOT NULL CHECK (role IN ('master', 'partner', 'store')),
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 制約: roleに応じた必須フィールド
  CONSTRAINT valid_role_assignment CHECK (
    (role = 'master' AND partner_id IS NULL AND store_id IS NULL) OR
    (role = 'partner' AND partner_id IS NOT NULL AND store_id IS NULL) OR
    (role = 'store' AND store_id IS NOT NULL)
  )
);

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_partner ON user_profiles(partner_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_store ON user_profiles(store_id);

-- ============================================
-- 4. RLS（Row Level Security）ポリシー更新
-- ============================================

-- user_profiles のRLS有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- user_profiles: 自分のプロファイルのみ参照可能
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- user_profiles: masterは全プロファイル参照可能
CREATE POLICY "Master can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'master'
    )
  );

-- partners: masterのみ全参照・編集可能
CREATE POLICY "Master can manage partners" ON partners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'master'
    )
  );

-- partners: partnerは自分の情報のみ参照可能
CREATE POLICY "Partner can view own record" ON partners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'partner' AND partner_id = partners.id
    )
  );

-- ============================================
-- 5. stores テーブルのRLSポリシー更新
-- ============================================

-- 既存ポリシーを削除して再作成
DROP POLICY IF EXISTS "Stores are viewable by everyone" ON stores;

-- 公開ページ（診断画面）用: 誰でも参照可能
CREATE POLICY "Public stores view" ON stores
  FOR SELECT USING (true);

-- Master: 全店舗を管理可能
CREATE POLICY "Master can manage all stores" ON stores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'master'
    )
  );

-- Partner: 担当店舗のみ参照可能
CREATE POLICY "Partner can view own stores" ON stores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'partner' AND partner_id = stores.partner_id
    )
  );

-- Store: 自店舗のみ参照可能
CREATE POLICY "Store can view own store" ON stores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'store' AND store_id = stores.id
    )
  );

-- ============================================
-- 6. children テーブルのRLSポリシー更新
-- ============================================

-- 既存ポリシーを保持しつつ、管理画面用ポリシーを追加

-- Master: 全児童データを参照可能
CREATE POLICY "Master can view all children" ON children
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'master'
    )
  );

-- Partner: 担当店舗の児童データを参照可能
CREATE POLICY "Partner can view children of own stores" ON children
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN stores s ON s.partner_id = up.partner_id
      WHERE up.id = auth.uid() AND up.role = 'partner' AND s.id = children.store_id
    )
  );

-- Store: 自店舗の児童データのみ参照可能
CREATE POLICY "Store can view own children" ON children
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'store' AND store_id = children.store_id
    )
  );

-- ============================================
-- 7. measurements テーブルのRLSポリシー更新
-- ============================================

-- Master: 全測定データを参照可能
CREATE POLICY "Master can view all measurements" ON measurements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'master'
    )
  );

-- Partner: 担当店舗の測定データを参照可能
CREATE POLICY "Partner can view measurements of own stores" ON measurements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN stores s ON s.partner_id = up.partner_id
      WHERE up.id = auth.uid() AND up.role = 'partner' AND s.id = measurements.store_id
    )
  );

-- Store: 自店舗の測定データのみ参照可能
CREATE POLICY "Store can view own measurements" ON measurements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'store' AND store_id = measurements.store_id
    )
  );

-- ============================================
-- 8. results テーブルのRLSポリシー更新
-- ============================================

-- Master: 全結果データを参照可能
CREATE POLICY "Master can view all results" ON results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'master'
    )
  );

-- Partner: 担当店舗の結果データを参照可能
CREATE POLICY "Partner can view results of own stores" ON results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN stores s ON s.partner_id = up.partner_id
      JOIN measurements m ON m.store_id = s.id
      WHERE up.id = auth.uid() AND up.role = 'partner' AND m.id = results.measurement_id
    )
  );

-- Store: 自店舗の結果データのみ参照可能
CREATE POLICY "Store can view own results" ON results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN measurements m ON m.store_id = up.store_id
      WHERE up.id = auth.uid() AND up.role = 'store' AND m.id = results.measurement_id
    )
  );

-- ============================================
-- 9. 更新日時の自動更新トリガー
-- ============================================

CREATE TRIGGER partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 10. ユーザー作成時に自動でプロファイルを作成する関数
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'store')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 既存トリガーがあれば削除して再作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 11. 便利なビュー（管理画面用）
-- ============================================

-- 店舗別統計ビュー
CREATE OR REPLACE VIEW store_statistics AS
SELECT
  s.id AS store_id,
  s.name AS store_name,
  s.slug,
  s.partner_id,
  p.name AS partner_name,
  COUNT(DISTINCT c.id) AS children_count,
  COUNT(DISTINCT m.id) AS measurements_count,
  MIN(m.measured_at) AS first_measurement_date,
  MAX(m.measured_at) AS last_measurement_date
FROM stores s
LEFT JOIN partners p ON p.id = s.partner_id
LEFT JOIN children c ON c.store_id = s.id
LEFT JOIN measurements m ON m.store_id = s.id
GROUP BY s.id, s.name, s.slug, s.partner_id, p.name;

-- 学年・性別分布ビュー
CREATE OR REPLACE VIEW grade_gender_distribution AS
SELECT
  c.store_id,
  c.grade,
  c.gender,
  COUNT(*) AS count
FROM children c
GROUP BY c.store_id, c.grade, c.gender;

-- 月別測定数ビュー
CREATE OR REPLACE VIEW monthly_measurements AS
SELECT
  m.store_id,
  DATE_TRUNC('month', m.measured_at) AS month,
  COUNT(*) AS measurement_count
FROM measurements m
GROUP BY m.store_id, DATE_TRUNC('month', m.measured_at)
ORDER BY month DESC;

-- 弱み分野統計ビュー
CREATE OR REPLACE VIEW weakness_statistics AS
SELECT
  m.store_id,
  r.weakness_class,
  COUNT(*) AS count
FROM results r
JOIN measurements m ON m.id = r.measurement_id
WHERE r.weakness_class IS NOT NULL
GROUP BY m.store_id, r.weakness_class;
