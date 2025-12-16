-- ============================================
-- ボール投げのボール種類カラムを追加
-- ============================================

-- measurements テーブルに ball_type カラムを追加
ALTER TABLE measurements
ADD COLUMN IF NOT EXISTS ball_type VARCHAR(10);

-- コメント追加
COMMENT ON COLUMN measurements.ball_type IS 'ボール投げで使用したボールの種類（1:1号球, 2:2号球, 3:3号球）';
