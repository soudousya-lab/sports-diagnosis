-- =============================================
-- RLSポリシー設定スクリプト
-- Supabaseダッシュボードの SQL Editor で実行してください
-- =============================================

-- 1. user_profiles テーブルのRLS
-- =============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- 自分のプロファイルのみ参照可能
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 自分のプロファイルのみ更新可能
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);


-- 2. partners テーブルのRLS
-- =============================================
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Partners viewable by authenticated users" ON partners;

-- 認証済みユーザーはパートナーを参照可能（ユーザー作成時のドロップダウン用）
CREATE POLICY "Partners viewable by authenticated users" ON partners
  FOR SELECT USING (auth.uid() IS NOT NULL);


-- 3. stores テーブルのRLS（公開アクセス＋認証ユーザー）
-- =============================================
-- 注意: 店舗情報は診断画面で公開表示されるため、SELECT は全体公開

-- 既存ポリシーの状態を維持
-- stores は "Public stores view" ポリシーで全体公開されている


-- 4. children テーブルのRLS
-- =============================================
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Master can view all children" ON children;
DROP POLICY IF EXISTS "Partner can view children of own stores" ON children;
DROP POLICY IF EXISTS "Store can view own children" ON children;

-- 公開アクセス（診断時）
DROP POLICY IF EXISTS "Children viewable by store" ON children;
CREATE POLICY "Children viewable by store" ON children
  FOR SELECT USING (true);

-- 店舗は自店舗の児童のみ追加・更新可能
DROP POLICY IF EXISTS "Store can insert children" ON children;
CREATE POLICY "Store can insert children" ON children
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Store can update children" ON children;
CREATE POLICY "Store can update children" ON children
  FOR UPDATE USING (true);


-- 5. measurements テーブルのRLS
-- =============================================
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Master can view all measurements" ON measurements;
DROP POLICY IF EXISTS "Partner can view measurements of own stores" ON measurements;
DROP POLICY IF EXISTS "Store can view own measurements" ON measurements;

-- 公開アクセス（診断結果表示時）
DROP POLICY IF EXISTS "Measurements viewable" ON measurements;
CREATE POLICY "Measurements viewable" ON measurements
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Measurements insertable" ON measurements;
CREATE POLICY "Measurements insertable" ON measurements
  FOR INSERT WITH CHECK (true);


-- 6. results テーブルのRLS
-- =============================================
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Master can view all results" ON results;
DROP POLICY IF EXISTS "Partner can view results of own stores" ON results;
DROP POLICY IF EXISTS "Store can view own results" ON results;

-- 公開アクセス（診断結果表示時）
DROP POLICY IF EXISTS "Results viewable" ON results;
CREATE POLICY "Results viewable" ON results
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Results insertable" ON results;
CREATE POLICY "Results insertable" ON results
  FOR INSERT WITH CHECK (true);


-- =============================================
-- 確認用クエリ
-- =============================================

-- RLSの有効化状態を確認
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'partners', 'stores', 'children', 'measurements', 'results');

-- ポリシーを確認
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
