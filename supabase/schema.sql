-- スポーツ能力診断システム データベーススキーマ

-- 店舗テーブル
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- URL用のスラッグ (例: store-a)
  logo_url TEXT,
  line_qr_url TEXT,
  address TEXT,
  phone VARCHAR(20),
  hours TEXT, -- 営業時間
  theme_color VARCHAR(7) DEFAULT '#003366', -- ブランドカラー (例: #003366)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 店舗管理者テーブル (認証用)
CREATE TABLE store_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 児童テーブル
CREATE TABLE children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  furigana VARCHAR(255),
  birthdate DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  grade VARCHAR(10) NOT NULL, -- k5, 1, 2, 3, 4, 5, 6
  height DECIMAL(5,1), -- cm
  weight DECIMAL(5,1), -- kg
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 測定記録テーブル
CREATE TABLE measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  measured_at DATE DEFAULT CURRENT_DATE,
  mode VARCHAR(10) CHECK (mode IN ('simple', 'detail')) DEFAULT 'simple',

  -- 7項目の測定値
  grip_right DECIMAL(5,1), -- 握力右 (kg)
  grip_left DECIMAL(5,1),  -- 握力左 (kg)
  jump INTEGER,            -- 立ち幅跳び (cm)
  dash DECIMAL(5,2),       -- 15mダッシュ (秒)
  doublejump INTEGER,      -- 連続立ち幅跳び (cm) - 詳細版のみ
  squat INTEGER,           -- 30秒スクワット (回) - 詳細版のみ
  sidestep INTEGER,        -- 反復横跳び (回) - 詳細版のみ
  throw DECIMAL(5,1),      -- ボール投げ (m) - 詳細版のみ

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 診断結果テーブル
CREATE TABLE results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  measurement_id UUID REFERENCES measurements(id) ON DELETE CASCADE UNIQUE,

  -- 診断結果
  motor_age DECIMAL(4,1),           -- 運動器年齢
  motor_age_diff DECIMAL(4,1),      -- 実年齢との差
  type_name VARCHAR(100),           -- 運動タイプ名
  type_description TEXT,            -- 運動タイプ説明
  class_level VARCHAR(20),          -- クラス判定 (beginner/standard/expert)
  weakness_class VARCHAR(100),      -- 弱点克服クラス

  -- 各項目の評点 (10段階)
  scores JSONB, -- {grip: 7, jump: 8, dash: 6, ...}

  -- 適性スポーツTOP6
  recommended_sports JSONB, -- [{name: "サッカー", icon: "⚽", aptitude: 8.5}, ...]

  -- 重点トレーニング4種目
  recommended_trainings JSONB, -- [{name: "...", desc: "...", reps: "...", effect: "..."}, ...]

  -- 1ヶ月目標
  goals JSONB, -- {grip: 19.5, jump: 150, dash: 3.55}

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- トレーニングマスターテーブル
CREATE TABLE trainings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ability_key VARCHAR(20) NOT NULL, -- grip, jump, dash, doublejump, squat, sidestep, throw
  age_group VARCHAR(10) NOT NULL,   -- young (年中〜小2), old (小3〜小6)
  name VARCHAR(255) NOT NULL,
  description TEXT,
  reps VARCHAR(100),
  effect TEXT,
  sort_order INTEGER DEFAULT 0
);

-- インデックス作成
CREATE INDEX idx_children_store ON children(store_id);
CREATE INDEX idx_measurements_child ON measurements(child_id);
CREATE INDEX idx_measurements_store ON measurements(store_id);
CREATE INDEX idx_measurements_date ON measurements(measured_at);
CREATE INDEX idx_results_measurement ON results(measurement_id);
CREATE INDEX idx_stores_slug ON stores(slug);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) 有効化
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;

-- 公開読み取りポリシー (診断画面用)
CREATE POLICY "Stores are viewable by everyone" ON stores
  FOR SELECT USING (true);

CREATE POLICY "Trainings are viewable by everyone" ON trainings
  FOR SELECT USING (true);

-- 測定結果の挿入は誰でも可能 (診断実行時)
CREATE POLICY "Anyone can insert children" ON children
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert measurements" ON measurements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert results" ON results
  FOR INSERT WITH CHECK (true);

-- 読み取りは店舗IDに紐づくデータのみ (後で認証と組み合わせる)
CREATE POLICY "Children readable by store" ON children
  FOR SELECT USING (true);

CREATE POLICY "Measurements readable by store" ON measurements
  FOR SELECT USING (true);

CREATE POLICY "Results readable by store" ON results
  FOR SELECT USING (true);

-- サンプル店舗データ
INSERT INTO stores (name, slug, address, phone, hours) VALUES
('かけっこ体幹教室 岡山本店', 'okayama-main', '岡山県岡山市北区○○1-2-3', '086-123-4567', '10:00-20:00'),
('FIREFITNESS 倉敷店', 'kurashiki', '岡山県倉敷市△△4-5-6', '086-987-6543', '9:00-21:00');

-- トレーニングデータ挿入
INSERT INTO trainings (ability_key, age_group, name, description, reps, effect, sort_order) VALUES
-- 握力 (young)
('grip', 'young', 'グーパー体操', '両手を力いっぱいグーパー', '朝夕20回', '握力向上', 1),
('grip', 'young', 'タオル絞り', '濡れタオルを絞る', '10回×2', '手首強化', 2),
-- 握力 (old)
('grip', 'old', '鉄棒ぶら下がり', '限界までぶら下がる', '3セット', '握力・体幹', 1),
('grip', 'old', '雲梯渡り', '端から端まで渡る', '3往復', '握力持久力', 2),

-- 瞬発力 (young)
('jump', 'young', 'うさぎジャンプ', '両足でピョンピョン', '20回×2', '下半身バネ', 1),
('jump', 'young', 'カエルジャンプ', 'しゃがんで跳ぶ', '10回×2', '瞬発力', 2),
-- 瞬発力 (old)
('jump', 'old', 'スクワットジャンプ', 'しゃがんで真上に跳ぶ', '10回×3', '瞬発力強化', 1),
('jump', 'old', 'ボックスジャンプ', '台に跳び乗る', '10回×3', '恐怖心克服', 2),

-- 移動能力 (young)
('dash', 'young', 'もも上げ', '膝を高く上げる', '10秒×3', 'フォーム改善', 1),
('dash', 'young', 'スキップ', '腕を振ってスキップ', '30m×3', 'リズム感', 2),
-- 移動能力 (old)
('dash', 'old', '坂道ダッシュ', '坂を駆け上がる', '30m×5', '脚力強化', 1),
('dash', 'old', 'ラダートレーニング', '素早い足さばき', '5分', '俊敏性', 2),

-- バランス (young)
('doublejump', 'young', '片足立ち', '30秒バランス', '左右3回', 'バランス', 1),
('doublejump', 'young', 'ケンケン', '片足でピョンピョン', '20m×左右', '脚力', 2),
-- バランス (old)
('doublejump', 'old', '連続ジャンプ', '立ち幅跳び2回連続', '10回×3', '連続動作', 1),
('doublejump', 'old', '片足スクワット', '片足でしゃがむ', '左右5回', 'バランス', 2),

-- 筋持久力 (young)
('squat', 'young', '椅子スクワット', '立ち座り', '10回×3', '脚持久力', 1),
('squat', 'young', '鬼ごっこ', '長時間走り回る', '15分', '全身持久力', 2),
-- 筋持久力 (old)
('squat', 'old', 'スクワット', '正しいフォームで', '20回×3', '筋持久力', 1),
('squat', 'old', 'ウォールシット', '壁で空気椅子', '30秒×3', '脚持久力', 2),

-- 敏捷性 (young)
('sidestep', 'young', '横歩き', 'カニさん歩き', '20m×3', '横移動', 1),
('sidestep', 'young', 'しっぽ取り', 'タオルを取り合う', '10分', '反応速度', 2),
-- 敏捷性 (old)
('sidestep', 'old', '反復横跳び練習', 'ラインを素早く跳ぶ', '20秒×5', '敏捷性', 1),
('sidestep', 'old', 'サイドステップ', '低姿勢で横移動', '20m×5', '下半身強化', 2),

-- 投力 (young)
('throw', 'young', 'ボール投げ遊び', '的当てゲーム', '20回', '投げ方習得', 1),
('throw', 'young', '紙飛行機投げ', '遠くに飛ばす', '10回', 'フォーム', 2),
-- 投力 (old)
('throw', 'old', 'シャドーピッチング', '正しいフォームで', '30回', 'フォーム改善', 1),
('throw', 'old', '遠投練習', '距離を伸ばす', '20球', '投力向上', 2);
