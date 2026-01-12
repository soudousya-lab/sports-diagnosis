-- ボール重量カラムを追加
-- 500g, 1kg, 2kg, 3kgの選択肢
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS ball_weight VARCHAR(10);

-- 既存データにはデフォルトで1kg（標準）を設定
UPDATE measurements SET ball_weight = '1kg' WHERE ball_weight IS NULL;
