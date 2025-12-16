-- スポーツ能力診断システム データベーススキーマ

-- 店舗テーブル
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- URL用のスラッグ (例: store-a)
  logo_url TEXT,
  line_qr_url TEXT, -- LINE QRコードURL（Supabase Storage）
  reservation_qr_url TEXT, -- 予約QRコードURL（Supabase Storage）
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

-- 更新・削除も許可 (編集機能用)
CREATE POLICY "Anyone can update children" ON children
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can update measurements" ON measurements
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can update results" ON results
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete results" ON results
  FOR DELETE USING (true);

-- サンプル店舗データ
INSERT INTO stores (name, slug, address, phone, hours) VALUES
('かけっこ体幹教室 岡山本店', 'okayama-main', '岡山県岡山市北区○○1-2-3', '086-123-4567', '10:00-20:00'),
('FIREFITNESS 倉敷店', 'kurashiki', '岡山県倉敷市△△4-5-6', '086-987-6543', '9:00-21:00');

-- トレーニングデータ挿入
INSERT INTO trainings (ability_key, age_group, name, description, reps, effect, sort_order) VALUES
-- 握力 (young) ※器具なし・自宅でできるもの
('grip', 'young', 'グーパー体操', '両手を力いっぱい握って開く動作を繰り返す', '朝夕30回ずつ（お風呂でやると効果的）', '握力向上', 1),
('grip', 'young', 'タオル絞り', '濡れタオルを両手で持ち限界まで絞る', '左右の手を入れ替えて各5回', '手首・前腕強化', 2),
('grip', 'young', 'ぶら下がりキープ', 'ドア枠や階段の手すりにぶら下がる', '限界まで×3回（毎日少しずつ伸ばす）', '握力・腕力', 3),
('grip', 'young', '腕相撲練習', '親子で腕相撲の構えで押し合う', '左右各30秒×2回', '握力・全身', 4),
-- 握力 (old) ※器具なし・自宅でできるもの
('grip', 'old', '鉄棒ぶら下がり', '公園の鉄棒や自宅のドア枠にぶら下がる', '限界まで×3回（間に1分休憩）', '握力・体幹', 1),
('grip', 'old', 'ぶら下がりキープ', 'タオルをドアにかけて両手で握りぶら下がる', '30秒目標×3回（徐々に時間を伸ばす）', '握力持久力', 2),
('grip', 'old', 'タオル絞り', '濡れタオルを全力で絞り切る', '左右交互に10回', '前腕・握力', 3),
('grip', 'old', '腕相撲練習', '親や兄弟と腕相撲で力比べ', '左右各3回（本気で）', '握力・腕力', 4),

-- 瞬発力 (young)
('jump', 'young', 'うさぎジャンプ', '両足を揃えて前方向にピョンピョン跳ぶ', '10歩×3セット（休憩30秒）', '下半身バネ', 1),
('jump', 'young', 'カエルジャンプ', 'しゃがんで手を床につき思いっきり跳ぶ', '5回×3セット（着地を丁寧に）', '瞬発力', 2),
('jump', 'young', '両足ジャンプ', 'その場で両足を揃えて真上に高く跳ぶ', '連続10回×3セット', '跳躍力', 3),
('jump', 'young', 'ジャンプタッチ', '壁や天井の目標に向かってジャンプしてタッチ', '10回×2セット（届く高さを上げていく）', '跳躍力・目標意識', 4),
-- 瞬発力 (old)
('jump', 'old', 'スクワットジャンプ', 'しゃがんで真上に全力で跳ぶ', '8回×4セット（セット間1分休憩）', '瞬発力強化', 1),
('jump', 'old', 'タックジャンプ', '膝を胸に引きつけながら高く跳ぶ', '6回×3セット（全力で高く）', '爆発力・体幹', 2),
('jump', 'old', '連続ジャンプ', '立ち幅跳びを連続で素早く2回', '5連続×4セット（休憩1分）', '連続動作', 3),
('jump', 'old', '立ち幅跳び練習', '腕を振って遠くへ跳ぶ練習', '全力5回×3セット（距離を測って記録）', '跳躍距離', 4),

-- 移動能力 (young)
('dash', 'young', 'もも上げ', '膝を腰の高さまでリズムよく上げる', '左右交互20回×2セット', 'フォーム改善', 1),
('dash', 'young', 'スキップ', '腕を大きく振ってリズムよくスキップ', '20歩×往復2回', 'リズム感・協調性', 2),
('dash', 'young', 'かけっこ遊び', '親子で「よーいドン」で短い距離を走る', '10m×5本（楽しみながら）', 'スタート練習', 3),
('dash', 'young', '動物歩き', 'クマ・ワニ・カエルなど動物になりきって歩く', '各動物10歩×2往復', '全身協調性', 4),
-- 移動能力 (old)
('dash', 'old', '坂道ダッシュ', '近所の坂を全力で駆け上がる', '5本（歩いて戻りながら休憩）', '脚力強化', 1),
('dash', 'old', 'もも上げ', '腕を振りながら膝を高く素早く上げる', '20秒全力×4セット（休憩30秒）', 'フォーム・スピード', 2),
('dash', 'old', '階段ダッシュ', '階段を一段飛ばしで駆け上がる', '3階分×3本', '脚力・心肺機能', 3),
('dash', 'old', 'ダッシュ＆ストップ', '全力で走って合図で急停止', '10m×10本', '加速力・ブレーキ力', 4),

-- バランス (young)
('doublejump', 'young', '片足立ち', '目を開けて片足でバランスをとる', '左右各30秒×2回', 'バランス感覚', 1),
('doublejump', 'young', 'ケンケン', '片足でリズムよく前進', '左右各10歩×3往復', '脚力・バランス', 2),
('doublejump', 'young', '片足バランスキャッチ', '片足立ちで親とボールをキャッチボール', '左右各1分（落ちたらやり直し）', 'バランス・集中力', 3),
('doublejump', 'young', '片足ホップ', '片足で連続ジャンプしながら前進', '左右各5歩×3セット', '脚力・バランス', 4),
-- バランス (old)
('doublejump', 'old', '目つぶり片足立ち', '目を閉じて片足でバランスをとる', '左右各30秒×3回（倒れたらやり直し）', 'バランス・集中力', 1),
('doublejump', 'old', 'T字バランス', '片足で立ち体を前に倒してT字を作る', '左右各20秒×3回', 'バランス・体幹', 2),
('doublejump', 'old', '片足ホップ', '片足で連続ジャンプしながら前進', '左右各10歩×4セット', '脚力・バランス', 3),
('doublejump', 'old', '片足スクワット', '壁に手を添えて片足でしゃがむ', '左右各5回×3セット', 'バランス・脚力', 4),

-- 筋持久力 (young)
('squat', 'young', '椅子スクワット', '椅子にお尻がつくまでしゃがんで立つ', '15回×2セット（ゆっくり丁寧に）', '脚持久力', 1),
('squat', 'young', 'カエル座りキープ', 'カエルのようにしゃがんだ姿勢をキープ', '30秒×3回', '脚・体幹持久力', 2),
('squat', 'young', 'お尻歩き', '座った状態でお尻で前後に進む', '前後10歩×3往復', '体幹・股関節', 3),
('squat', 'young', 'ヒップリフト', '仰向けでお尻を持ち上げてキープ', '10秒キープ×10回', 'お尻・体幹', 4),
-- 筋持久力 (old)
('squat', 'old', 'スクワット', '正しいフォームでゆっくり深くしゃがむ', '15回×3セット（休憩45秒）', '筋持久力', 1),
('squat', 'old', 'ウォールシット', '背中を壁につけて空気椅子', '30秒→45秒→60秒と日々伸ばす', '脚持久力', 2),
('squat', 'old', 'ランジ', '足を前に踏み出して深くしゃがむ', '左右交互20回×2セット', '脚力・バランス', 3),
('squat', 'old', 'ヒップリフト', '仰向けで片足を上げてお尻を持ち上げる', '左右各10回×2セット', 'お尻・体幹', 4),

-- 敏捷性 (young)
('sidestep', 'young', '横歩き', 'カニさんのように腰を低くして横移動', '左右各10歩×3往復', '横移動', 1),
('sidestep', 'young', 'しっぽ取り', 'タオルをズボンに挟んで取り合う遊び', '1回2分×3回（親子で）', '反応速度・俊敏性', 2),
('sidestep', 'young', 'タッチ鬼', '親が出す手をタッチする遊び', '1回30秒×5セット', '反応速度', 3),
('sidestep', 'young', 'ジグザグ走', 'ペットボトルなど目印の間をジグザグに走る', '5往復×3セット', '方向転換', 4),
-- 敏捷性 (old)
('sidestep', 'old', '反復横跳び練習', 'テープで3本線を作り素早く跳ぶ', '20秒全力×5セット（休憩20秒）', '敏捷性', 1),
('sidestep', 'old', 'サイドステップ', '低姿勢で素早く横移動', '左右各10歩×4セット', '下半身・横移動', 2),
('sidestep', 'old', 'シャッフル', 'サイドステップを素早く連続で行う', '10秒全力×6セット（休憩20秒）', '俊敏性', 3),
('sidestep', 'old', '4方向タッチ', '中央から前後左右の目印にタッチして戻る', '1セット8タッチ×5セット', '全方向敏捷性', 4),

-- 投力 (young)
('throw', 'young', 'ボール投げ遊び', '丸めた靴下やぬいぐるみを的に向かって投げる', '10球×3セット（フォーム意識）', '投げ方習得', 1),
('throw', 'young', '紙飛行機投げ', '肘を高く上げて遠くに飛ばす', '5回×4セット（どこまで飛ぶか競争）', 'フォーム習得', 2),
('throw', 'young', '風船バレー', '風船を落とさないように打ち合う', '連続50回を目標', '投げる動作・反応', 3),
('throw', 'young', '的当て遊び', 'ペットボトルなどを並べて倒す', '10球投げて何本倒せるか×3回', 'コントロール', 4),
-- 投力 (old)
('throw', 'old', 'シャドーピッチング', 'ステップを入れて全力投球動作', '20回×3セット（1球ずつフォーム確認）', 'フォーム改善', 1),
('throw', 'old', '壁当て', '壁に向かってボールを投げてキャッチ', '50球（徐々に距離を伸ばす）', '投力・コントロール', 2),
('throw', 'old', '遠投練習', '公園などで思いっきり遠くへ投げる', '全力10球×3セット（距離を記録）', '投力向上', 3),
('throw', 'old', '的当て遊び', '段ボールに的を描いて当てる練習', '10球×5セット（的を小さくしていく）', 'コントロール', 4);
