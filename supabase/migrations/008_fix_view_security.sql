-- ビューの SECURITY DEFINER を SECURITY INVOKER に変更
-- SECURITY INVOKER はクエリを実行するユーザーの権限でRLSが適用される

-- 店舗別統計ビュー
CREATE OR REPLACE VIEW store_statistics
WITH (security_invoker = true)
AS
SELECT
  s.id AS store_id,
  s.name AS store_name,
  s.slug,
  s.partner_id,
  p.name AS partner_name,
  COUNT(DISTINCT c.id) AS children_count,
  COUNT(DISTINCT m.id) AS measurements_count,
  MIN(m.measured_at) AS first_measurement_date,
  MAX(m.measured_at) AS last_measurement_date
FROM stores s
LEFT JOIN partners p ON p.id = s.partner_id
LEFT JOIN children c ON c.store_id = s.id
LEFT JOIN measurements m ON m.store_id = s.id
GROUP BY s.id, s.name, s.slug, s.partner_id, p.name;

-- 学年・性別分布ビュー
CREATE OR REPLACE VIEW grade_gender_distribution
WITH (security_invoker = true)
AS
SELECT
  c.store_id,
  c.grade,
  c.gender,
  COUNT(*) AS count
FROM children c
GROUP BY c.store_id, c.grade, c.gender;

-- 月別測定数ビュー
CREATE OR REPLACE VIEW monthly_measurements
WITH (security_invoker = true)
AS
SELECT
  m.store_id,
  DATE_TRUNC('month', m.measured_at) AS month,
  COUNT(*) AS measurement_count
FROM measurements m
GROUP BY m.store_id, DATE_TRUNC('month', m.measured_at)
ORDER BY month DESC;

-- 弱み分野統計ビュー
CREATE OR REPLACE VIEW weakness_statistics
WITH (security_invoker = true)
AS
SELECT
  m.store_id,
  r.weakness_class,
  COUNT(*) AS count
FROM results r
JOIN measurements m ON m.id = r.measurement_id
WHERE r.weakness_class IS NOT NULL
GROUP BY m.store_id, r.weakness_class;
