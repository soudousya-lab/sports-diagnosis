-- ============================================
-- 雲梯渡りのトレーニング回数を現実的な内容に修正
-- ============================================

-- 雲梯関連のトレーニングを検索して回数を修正
UPDATE trainings
SET reps = '片道×3回（休憩しながら）'
WHERE name LIKE '%雲梯%' AND reps LIKE '%3往復%';

-- もし「端から端まで」という表現があれば修正
UPDATE trainings
SET
  description = REPLACE(description, '端から端まで3往復', '片道を3回'),
  reps = '片道×3回（休憩を入れながら）'
WHERE description LIKE '%3往復%' OR reps LIKE '%3往復%';

-- 雲梯渡りを具体的に修正（名前で検索）
UPDATE trainings
SET
  reps = '片道×2〜3回（できる範囲で）',
  description = '雲梯をぶら下がって進む。途中で落ちてもOK、少しずつ距離を伸ばす'
WHERE name = '雲梯渡り';
