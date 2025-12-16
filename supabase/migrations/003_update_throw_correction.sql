-- ============================================
-- 既存データのボール投げを22cm補正で更新
-- テスト太郎以外のデータに対して補正係数1.22を適用
-- ============================================

-- 補正を適用（元の値 × 1.22）し、ball_typeを22に設定
UPDATE measurements m
SET
  throw = ROUND(throw * 1.22 * 10) / 10,
  ball_type = '22'
FROM children c
WHERE m.child_id = c.id
  AND c.name != 'テスト太郎'
  AND m.ball_type IS NULL;

-- テスト太郎のデータにはball_typeのみ設定（補正不要の場合）
-- UPDATE measurements m
-- SET ball_type = '9'
-- FROM children c
-- WHERE m.child_id = c.id
--   AND c.name = 'テスト太郎'
--   AND m.ball_type IS NULL;
