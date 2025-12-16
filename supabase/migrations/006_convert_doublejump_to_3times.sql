-- ============================================
-- 連続立ち幅跳びを2回版→3回版に変換
-- 既存データに1.5倍の補正を適用
-- ============================================

-- 既存の連続立ち幅跳びデータを1.5倍に変換
UPDATE measurements
SET doublejump = ROUND(doublejump * 1.5)
WHERE doublejump IS NOT NULL;
