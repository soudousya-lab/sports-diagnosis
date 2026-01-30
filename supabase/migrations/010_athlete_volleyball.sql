-- NOBISHIRO ATHLETE VOLLEYBALL用テーブル作成

-- バレーボール選手テーブル
CREATE TABLE IF NOT EXISTS volleyball_athletes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  furigana VARCHAR(255),
  birthdate DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  school_year VARCHAR(10) NOT NULL, -- '1', '2' (中学1年、2年など)
  position VARCHAR(20), -- 'S', 'OH', 'MB', 'OP', 'L' (セッター、アウトサイドヒッター、ミドルブロッカー、オポジット、リベロ)
  height DECIMAL(5,1), -- 身長 (cm)
  weight DECIMAL(5,1), -- 体重 (kg)
  team_name VARCHAR(255) DEFAULT 'チームA', -- チーム名
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- バレーボール測定記録テーブル
CREATE TABLE IF NOT EXISTS volleyball_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES volleyball_athletes(id) ON DELETE CASCADE,
  measured_at DATE DEFAULT CURRENT_DATE,

  -- 測定項目（記録用紙に基づく）
  vertical_jump INTEGER,          -- 垂直跳び (cm)
  reach_height INTEGER,           -- 指高リーチ (cm)
  spike_reach INTEGER,            -- 最高到達点 (cm)
  approach_jump INTEGER,          -- 助走片足立ち/助走ジャンプ (cm)
  continuous_jump INTEGER,        -- 連続立ち幅跳び (cm)
  serve_speed DECIMAL(5,1),       -- サーブスピード (km/h)
  side_step INTEGER,              -- 反復横跳び (回/20秒)

  -- メタ情報
  measured_by VARCHAR(100),       -- 測定者
  notes TEXT,                     -- メモ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- バレーボール診断結果テーブル
CREATE TABLE IF NOT EXISTS volleyball_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  measurement_id UUID REFERENCES volleyball_measurements(id) ON DELETE CASCADE UNIQUE,

  -- 総合評価
  overall_score DECIMAL(4,1),           -- 総合スコア (100点満点)
  physical_age DECIMAL(4,1),            -- フィジカル年齢
  physical_age_diff DECIMAL(4,1),       -- 実年齢との差

  -- カテゴリ別スコア (10点満点)
  scores JSONB, -- {jump_power: 8, reach: 7, agility: 6, serve_power: 7, continuous_power: 8}

  -- 各項目の詳細スコア (10点満点)
  item_scores JSONB, -- {vertical_jump: 7, reach_height: 9, spike_reach: 8, ...}

  -- ポジション適性
  position_aptitudes JSONB, -- [{position: "MB", aptitude: 85, name: "ミドルブロッカー"}, ...]

  -- 強み・弱み
  strengths JSONB,  -- [{item: "vertical_jump", score: 9, label: "跳躍力"}, ...]
  weaknesses JSONB, -- [{item: "side_step", score: 4, label: "敏捷性"}, ...]

  -- トレーニング推奨
  recommended_trainings JSONB,

  -- 目標設定
  goals JSONB, -- {vertical_jump: 65, spike_reach: 320, ...}

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- バレーボール用トレーニングマスター
CREATE TABLE IF NOT EXISTS volleyball_trainings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ability_key VARCHAR(50) NOT NULL,    -- jump_power, reach, agility, serve_power, continuous_power
  school_level VARCHAR(20) NOT NULL,   -- 'junior_high', 'high_school'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  reps VARCHAR(100),
  sets INTEGER,
  rest_time VARCHAR(50),
  video_url TEXT,
  effect TEXT,
  caution TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_volleyball_athletes_school_year ON volleyball_athletes(school_year);
CREATE INDEX IF NOT EXISTS idx_volleyball_athletes_position ON volleyball_athletes(position);
CREATE INDEX IF NOT EXISTS idx_volleyball_athletes_team ON volleyball_athletes(team_name);
CREATE INDEX IF NOT EXISTS idx_volleyball_measurements_athlete ON volleyball_measurements(athlete_id);
CREATE INDEX IF NOT EXISTS idx_volleyball_measurements_date ON volleyball_measurements(measured_at);
CREATE INDEX IF NOT EXISTS idx_volleyball_results_measurement ON volleyball_results(measurement_id);

-- 更新日時の自動更新トリガー
DROP TRIGGER IF EXISTS volleyball_athletes_updated_at ON volleyball_athletes;
CREATE TRIGGER volleyball_athletes_updated_at
  BEFORE UPDATE ON volleyball_athletes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS有効化
ALTER TABLE volleyball_athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE volleyball_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE volleyball_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE volleyball_trainings ENABLE ROW LEVEL SECURITY;

-- 公開ポリシー（誰でも読み書き可能）- 既存ポリシーがあれば削除して再作成
DROP POLICY IF EXISTS "volleyball_athletes_all" ON volleyball_athletes;
DROP POLICY IF EXISTS "volleyball_measurements_all" ON volleyball_measurements;
DROP POLICY IF EXISTS "volleyball_results_all" ON volleyball_results;
DROP POLICY IF EXISTS "volleyball_trainings_select" ON volleyball_trainings;

CREATE POLICY "volleyball_athletes_all" ON volleyball_athletes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "volleyball_measurements_all" ON volleyball_measurements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "volleyball_results_all" ON volleyball_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "volleyball_trainings_select" ON volleyball_trainings FOR SELECT USING (true);

-- バレーボール用トレーニングデータ挿入
INSERT INTO volleyball_trainings (ability_key, school_level, name, description, reps, sets, effect, caution, sort_order) VALUES
-- 跳躍力（jump_power）
('jump_power', 'junior_high', 'スクワットジャンプ', 'スクワット姿勢から真上に全力ジャンプ', '10回', 4, '下半身パワー強化', '着地時の姿勢を意識', 1),
('jump_power', 'junior_high', 'ボックスジャンプ', '台の上に両足でジャンプして乗る', '10回', 3, 'ジャンプ力・瞬発力', '台の高さは徐々に上げる', 2),
('jump_power', 'junior_high', 'タックジャンプ', '膝を胸に引きつけながら高くジャンプ', '8回', 3, '股関節の瞬発力', 'しっかり膝を引き上げる', 3),
('jump_power', 'junior_high', 'デプスジャンプ', '台から降りて着地と同時にジャンプ', '8回', 3, '爆発的なジャンプ力向上', '膝への負担に注意、着地は柔らかく', 4),
('jump_power', 'high_school', 'ウェイテッドジャンプ', 'ダンベルを持ってスクワットジャンプ', '8回', 4, '負荷をかけた跳躍力向上', '重量は徐々に増やす', 1),
('jump_power', 'high_school', 'パワークリーン', 'バーベルを床から肩まで一気に引き上げる', '5回', 4, '全身の爆発力', 'フォームを正しく習得してから', 2),

-- リーチ・到達点（reach）
('reach', 'junior_high', 'スパイクジャンプ練習', '助走をつけてスパイクの動きでジャンプ', '10回', 3, '実践的な最高到達点向上', 'フォームを意識', 1),
('reach', 'junior_high', ' 壁タッチジャンプ', '壁に向かってジャンプし高い位置をタッチ', '10回', 3, '到達点の意識向上', '目標を少しずつ上げる', 2),
('reach', 'junior_high', 'アプローチステップ練習', 'スパイクの助走ステップを反復', '20回', 2, '効率的な助走習得', 'タイミングを意識', 3),
('reach', 'high_school', 'ブロックジャンプ連続', 'ネット前で連続ブロックジャンプ', '10回×3セット', 3, 'ブロック時の到達点', '素早い切り返し', 1),
('reach', 'high_school', '片足踏切練習', '片足でのジャンプ力を強化', '左右各10回', 3, 'スパイク時の高さ向上', 'バランスを意識', 2),

-- 敏捷性（agility）
('agility', 'junior_high', 'サイドシャッフル', '低姿勢で素早く左右に移動', '10m往復', 4, 'レシーブ時の動き改善', '重心を低く保つ', 1),
('agility', 'junior_high', '反復横跳び強化', 'テープを使って素早く跳ぶ', '20秒全力', 5, '横移動の俊敏性', '膝を曲げて重心低く', 2),
('agility', 'junior_high', 'ラダートレーニング', 'ラダーを使った様々なステップワーク', '各種10m', 3, '足の回転速度向上', 'スピードより正確さを優先', 3),
('agility', 'junior_high', 'Tテスト練習', 'T字パターンで前後左右に素早く移動', '全力1回', 5, '全方向への切り返し', '方向転換時の姿勢を意識', 4),
('agility', 'high_school', 'リアクションドリル', '合図に反応して素早く動く', '10回', 4, '反応速度向上', '予測せず反応する', 1),
('agility', 'high_school', 'コーンドリル', 'コーンを使った複雑なステップワーク', '各種30秒', 4, '試合中の動きに直結', 'スピードを上げていく', 2),

-- サーブ力（serve_power）
('serve_power', 'junior_high', 'シャドーサーブ', 'ボールなしでサーブのフォーム練習', '30回', 2, 'フォーム改善', '肩の可動域を意識', 1),
('serve_power', 'junior_high', 'メディシンボール投げ', 'メディシンボールをサーブの動きで投げる', '15回', 3, '上半身のパワー', '体幹を使う', 2),
('serve_power', 'junior_high', '壁サーブ練習', '壁に向かってサーブを打つ', '50本', 2, 'コントロール・パワー', 'フォーム確認しながら', 3),
('serve_power', 'high_school', 'ジャンプサーブ練習', 'ジャンプサーブの反復練習', '30本', 3, '実践的なサーブ力', 'トスの高さ・位置を一定に', 1),
('serve_power', 'high_school', '肩のチューブトレーニング', 'ゴムチューブで肩周りを強化', '20回×3', 3, '肩の安定性・パワー', '急な動きを避ける', 2),

-- 連続跳躍力（continuous_power）
('continuous_power', 'junior_high', '連続立ち幅跳び', '立ち幅跳びを3〜5回連続で行う', '5連続×5セット', 3, '連続ジャンプの持久力', '着地後すぐに次のジャンプ', 1),
('continuous_power', 'junior_high', 'バウンディング', '大きな歩幅で跳ねながら走る', '30m', 4, '下半身の連続パワー', 'リズムよく', 2),
('continuous_power', 'junior_high', '縄跳び（二重跳び）', '連続で二重跳びを行う', '30回', 3, '瞬発的な連続ジャンプ', '手首を使う', 3),
('continuous_power', 'high_school', 'プライオメトリクス', '様々なジャンプを連続で行う', '各種10回', 4, '爆発的な連続パワー', '膝への負担に注意', 1),
('continuous_power', 'high_school', 'ブロック連続ジャンプ', '3箇所を移動しながら連続ブロック', '10セット', 4, '試合を想定した連続力', 'スピードと高さを両立', 2);

-- サンプル選手データ挿入（記録用紙のデータに基づく）
INSERT INTO volleyball_athletes (name, school_year, gender, team_name) VALUES
('笠井', '2', 'female', '岡山北SVC'),
('片山', '1', 'female', '岡山北SVC'),
('延原', '1', 'female', '岡山北SVC'),
('藤村', '2', 'female', '岡山北SVC'),
('福原', '1', 'female', '岡山北SVC'),
('山本', '1', 'female', '岡山北SVC'),
('岩本', '1', 'female', '岡山北SVC'),
('三原', '1', 'female', '岡山北SVC'),
('渡', '1', 'female', '岡山北SVC');

-- サンプル測定データ挿入
-- 選手IDを取得して測定データを挿入（名前で参照）
DO $$
DECLARE
  athlete_record RECORD;
  measurement_uuid UUID;
BEGIN
  -- 笠井選手（2年）
  SELECT id INTO athlete_record FROM volleyball_athletes WHERE name = '笠井' LIMIT 1;
  IF athlete_record.id IS NOT NULL THEN
    INSERT INTO volleyball_measurements (athlete_id, measured_at, vertical_jump, reach_height, spike_reach, approach_jump, continuous_jump, serve_speed, side_step)
    VALUES (athlete_record.id, '2024-12-26', 42, 205, 249, 28, 626, 56.60, 53)
    RETURNING id INTO measurement_uuid;
  END IF;

  -- 片山選手（1年）
  SELECT id INTO athlete_record FROM volleyball_athletes WHERE name = '片山' LIMIT 1;
  IF athlete_record.id IS NOT NULL THEN
    INSERT INTO volleyball_measurements (athlete_id, measured_at, vertical_jump, reach_height, spike_reach, approach_jump, continuous_jump, serve_speed, side_step)
    VALUES (athlete_record.id, '2024-12-26', 15, 215, 264, 28, 634, 52.53, 53)
    RETURNING id INTO measurement_uuid;
  END IF;

  -- 延原選手（1年）
  SELECT id INTO athlete_record FROM volleyball_athletes WHERE name = '延原' LIMIT 1;
  IF athlete_record.id IS NOT NULL THEN
    INSERT INTO volleyball_measurements (athlete_id, measured_at, vertical_jump, reach_height, spike_reach, approach_jump, continuous_jump, serve_speed, side_step)
    VALUES (athlete_record.id, '2024-12-26', 42, 200, 242, 67, 565, 51.52, 52)
    RETURNING id INTO measurement_uuid;
  END IF;

  -- 藤村選手（2年）
  SELECT id INTO athlete_record FROM volleyball_athletes WHERE name = '藤村' LIMIT 1;
  IF athlete_record.id IS NOT NULL THEN
    INSERT INTO volleyball_measurements (athlete_id, measured_at, vertical_jump, reach_height, spike_reach, approach_jump, continuous_jump, serve_speed, side_step)
    VALUES (athlete_record.id, '2024-12-26', 45, 187, 232, 61, 568, 51.55, 55)
    RETURNING id INTO measurement_uuid;
  END IF;

  -- 福原選手（1年）
  SELECT id INTO athlete_record FROM volleyball_athletes WHERE name = '福原' LIMIT 1;
  IF athlete_record.id IS NOT NULL THEN
    INSERT INTO volleyball_measurements (athlete_id, measured_at, vertical_jump, reach_height, spike_reach, approach_jump, continuous_jump, serve_speed, side_step)
    VALUES (athlete_record.id, '2024-12-26', 57, 203, 275, 60, 653, 52.54, 55)
    RETURNING id INTO measurement_uuid;
  END IF;

  -- 山本選手（1年）
  SELECT id INTO athlete_record FROM volleyball_athletes WHERE name = '山本' LIMIT 1;
  IF athlete_record.id IS NOT NULL THEN
    INSERT INTO volleyball_measurements (athlete_id, measured_at, vertical_jump, reach_height, spike_reach, approach_jump, continuous_jump, serve_speed, side_step)
    VALUES (athlete_record.id, '2024-12-26', 18, 218, 272, 7, 682, 54.56, NULL)
    RETURNING id INTO measurement_uuid;
  END IF;

  -- 岩本選手（1年）
  SELECT id INTO athlete_record FROM volleyball_athletes WHERE name = '岩本' LIMIT 1;
  IF athlete_record.id IS NOT NULL THEN
    INSERT INTO volleyball_measurements (athlete_id, measured_at, vertical_jump, reach_height, spike_reach, approach_jump, continuous_jump, serve_speed, side_step)
    VALUES (athlete_record.id, '2024-12-26', 42, 265, 248, 75, 563, 54.55, 55)
    RETURNING id INTO measurement_uuid;
  END IF;

  -- 三原選手（1年）
  SELECT id INTO athlete_record FROM volleyball_athletes WHERE name = '三原' LIMIT 1;
  IF athlete_record.id IS NOT NULL THEN
    INSERT INTO volleyball_measurements (athlete_id, measured_at, vertical_jump, reach_height, spike_reach, approach_jump, continuous_jump, serve_speed, side_step)
    VALUES (athlete_record.id, '2024-12-26', 44, 195, 246, 47, 593, 50.56, 73)
    RETURNING id INTO measurement_uuid;
  END IF;

  -- 渡選手（1年）
  SELECT id INTO athlete_record FROM volleyball_athletes WHERE name = '渡' LIMIT 1;
  IF athlete_record.id IS NOT NULL THEN
    INSERT INTO volleyball_measurements (athlete_id, measured_at, vertical_jump, reach_height, spike_reach, approach_jump, continuous_jump, serve_speed, side_step)
    VALUES (athlete_record.id, '2024-12-26', 45, 195, 235, 71, 618, 54.49, 54)
    RETURNING id INTO measurement_uuid;
  END IF;

END $$;
