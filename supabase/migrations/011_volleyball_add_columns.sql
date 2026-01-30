-- volleyball_measurements テーブルに新しいカラムを追加
-- serve_speed を ball_throw にリネーム
-- standing_jump, single_leg_balance を追加

-- 既存のserve_speedカラムをball_throwにリネーム
ALTER TABLE volleyball_measurements
RENAME COLUMN serve_speed TO ball_throw;

-- 立ち幅跳び (cm) を追加
ALTER TABLE volleyball_measurements
ADD COLUMN IF NOT EXISTS standing_jump INTEGER;

-- 片足立ちバランス (秒) を追加
ALTER TABLE volleyball_measurements
ADD COLUMN IF NOT EXISTS single_leg_balance INTEGER;

-- コメントを追加
COMMENT ON COLUMN volleyball_measurements.ball_throw IS '3kgボール投げ (メートル)';
COMMENT ON COLUMN volleyball_measurements.standing_jump IS '立ち幅跳び (cm)';
COMMENT ON COLUMN volleyball_measurements.single_leg_balance IS '片足立ちバランス (秒)';
