# NOBISHIRO FITNESS 仕様書

## パーソナルトレーニングジム向け 総合フィットネス診断システム

---

## 1. システム概要

### 1.1 コンセプト

**NOBISHIRO FITNESS**は、パーソナルトレーニングジムへの導入を前提とした、科学的根拠に基づく総合フィットネス診断システムです。

「運動評価」「栄養評価」「体組成評価」「アライメント評価」の4つの軸から詳細なパーソナルデータを出力し、クライアント一人ひとりに最適化されたトレーニングプログラムと生活改善提案を可能にします。

### 1.2 ターゲット市場

| 市場セグメント | 説明 |
|---------------|------|
| **パーソナルジム** | マンツーマン指導のフィットネススタジオ |
| **高級フィットネスクラブ** | 会員制の総合フィットネス施設 |
| **ダイエット専門ジム** | ボディメイク・減量に特化したジム |
| **アスリート向け施設** | トップアスリートのコンディショニング施設 |
| **医療連携型ジム** | 整形外科・リハビリと連携したメディカルフィットネス |
| **コンディショニングサロン** | 姿勢改善・ボディケア専門店 |

### 1.3 他のNOBISHIROシリーズとの違い

| 項目 | KIDS | ATHLETE | HEALTH | FITNESS |
|------|------|---------|--------|---------|
| 対象 | 小学生 | 中高生 | 一般成人 | ジム会員 |
| 目的 | 適性発見 | 競技力向上 | 健康維持 | ボディメイク・最適化 |
| 評価軸 | 運動能力 | 競技能力 | 体力年齢 | 4軸総合評価 |
| 深度 | 基本 | 詳細 | 中程度 | 非常に詳細 |
| 出力 | 適性スポーツ | トレーニング計画 | 生活改善 | パーソナライズドプログラム |

### 1.4 システムの価値提案

**ジム側のメリット:**
- 科学的根拠に基づく差別化
- 継続率向上（可視化による動機付け）
- 客単価向上（詳細診断オプション）
- トレーナーの指導効率化

**クライアント側のメリット:**
- 自分の体を深く理解
- 明確な改善ポイントの把握
- 進捗の可視化によるモチベーション維持
- パーソナライズされたプログラム

---

## 2. 評価カテゴリ（4軸評価）

### 2.1 概要

NOBISHIRO FITNESSは以下の4つの評価軸からクライアントを多角的に分析します。

```
┌──────────────────────────────────────────────────────────────┐
│                    NOBISHIRO FITNESS                         │
│                     4軸総合評価                              │
├────────────────┬────────────────┬──────────────┬─────────────┤
│  運動評価      │  栄養評価      │  体組成評価  │ アライメント│
│  MOVEMENT      │  NUTRITION     │  BODY COMP   │ ALIGNMENT   │
├────────────────┼────────────────┼──────────────┼─────────────┤
│ ・筋力テスト   │ ・食事記録     │ ・InBody等   │ ・姿勢分析  │
│ ・可動域       │ ・栄養素分析   │ ・部位別筋量 │ ・動作分析  │
│ ・心肺機能     │ ・食習慣       │ ・体脂肪分布 │ ・左右差    │
│ ・ファンクション│・水分/睡眠    │ ・代謝評価   │ ・機能障害  │
└────────────────┴────────────────┴──────────────┴─────────────┘
```

---

## 3. 運動評価（MOVEMENT ASSESSMENT）

### 3.1 筋力評価（8項目）

| No | 項目 | 測定方法 | 単位 | 評価対象 |
|----|------|---------|------|---------|
| 1 | **ベンチプレス1RM推定** | 実測or換算式 | kg | 胸・肩・上腕三頭筋 |
| 2 | **スクワット1RM推定** | 実測or換算式 | kg | 大腿四頭筋・臀筋 |
| 3 | **デッドリフト1RM推定** | 実測or換算式 | kg | ハムストリングス・背筋 |
| 4 | **懸垂回数** | 最大回数 | 回 | 広背筋・上腕二頭筋 |
| 5 | **プッシュアップ回数** | 60秒間 | 回 | 胸・肩・体幹持久力 |
| 6 | **プランク保持** | 最大保持時間 | 秒 | 体幹安定性 |
| 7 | **片足スクワット** | 左右各最大回数 | 回 | 下肢筋力バランス |
| 8 | **握力** | 左右測定 | kg | 全身筋力の指標 |

### 3.2 可動域評価（10項目）

| No | 部位 | 測定項目 | 基準値 | 評価ポイント |
|----|------|---------|--------|-------------|
| 1 | 肩関節 | 屈曲 | 180° | オーバーヘッド動作 |
| 2 | 肩関節 | 外旋 | 90° | 投球・プレス動作 |
| 3 | 肩関節 | 内旋 | 70° | ローテーターカフ |
| 4 | 股関節 | 屈曲 | 120° | スクワット深さ |
| 5 | 股関節 | 外転 | 45° | サイド動作 |
| 6 | 股関節 | 内旋/外旋 | 各45° | 回旋動作 |
| 7 | 足関節 | 背屈 | 20° | スクワット・歩行 |
| 8 | 胸椎 | 回旋 | 左右各45° | ゴルフ・回旋動作 |
| 9 | 腰椎 | 屈曲/伸展 | 屈曲60°/伸展25° | 腰痛リスク |
| 10 | ハムストリングス | SLR角度 | 80° | 柔軟性 |

### 3.3 心肺機能評価（4項目）

| No | 項目 | 測定方法 | 単位 | 評価対象 |
|----|------|---------|------|---------|
| 1 | **VO2max推定** | 12分間走/Åstrandテスト | ml/kg/min | 最大酸素摂取量 |
| 2 | **安静時心拍数** | 起床時測定 | bpm | 心臓効率 |
| 3 | **心拍回復率** | 運動後1分の心拍低下 | bpm | 回復力 |
| 4 | **乳酸閾値推定** | 段階的負荷テスト | % of HRmax | 持久力効率 |

### 3.4 ファンクショナル評価（6項目）

| No | テスト | 評価内容 | スコア |
|----|--------|---------|--------|
| 1 | **FMS（7項目）** | 機能的動作スクリーニング | 0-21点 |
| 2 | **オーバーヘッドスクワット** | 上半身・下半身の連動 | 0-3点 |
| 3 | **インラインランジ** | 下肢の安定性・可動性 | 0-3点 |
| 4 | **ハードルステップ** | 股関節可動性・安定性 | 0-3点 |
| 5 | **アクティブSLR** | ハムストリングス柔軟性 | 0-3点 |
| 6 | **Yバランステスト** | 動的バランス | 前方/後内/後外 cm |

---

## 4. 栄養評価（NUTRITION ASSESSMENT）

### 4.1 食事記録分析

#### 入力方式
- **写真記録**: 食事写真をアップロード（AI解析オプション）
- **手動入力**: 食品・分量を選択入力
- **連携アプリ**: MyFitnessPal等との連携

#### 分析期間
- **スポット**: 直近3日間
- **スタンダード**: 7日間
- **プレミアム**: 14日間以上

### 4.2 栄養素分析（マクロ・ミクロ）

#### マクロ栄養素

| 項目 | 分析内容 | 目標設定基準 |
|------|---------|-------------|
| **総カロリー** | 摂取エネルギー | TDEE × 目的係数 |
| **タンパク質** | 摂取量・タイミング | 体重×1.6-2.2g（目的別） |
| **脂質** | 総量・脂肪酸バランス | 総カロリーの20-35% |
| **炭水化物** | 総量・GI値・食物繊維 | 残りのカロリー |
| **PFCバランス** | 三大栄養素の比率 | 目的別最適比率 |

#### ミクロ栄養素

| カテゴリ | 分析項目 |
|---------|---------|
| **ビタミン** | A, B群(B1,B2,B6,B12), C, D, E, K, 葉酸 |
| **ミネラル** | 鉄, カルシウム, マグネシウム, 亜鉛, カリウム, ナトリウム |
| **その他** | オメガ3/6比率, 食物繊維, 水分摂取量 |

### 4.3 食習慣評価

| 評価項目 | 質問例 | スコア |
|---------|--------|--------|
| **食事頻度** | 1日の食事回数 | 1-5点 |
| **食事時間** | 規則性、最終食事時間 | 1-5点 |
| **咀嚼習慣** | よく噛んで食べるか | 1-5点 |
| **外食頻度** | 週の外食・中食回数 | 1-5点 |
| **間食習慣** | 間食の頻度・内容 | 1-5点 |
| **飲酒習慣** | 頻度・量・種類 | 1-5点 |
| **サプリメント** | 使用状況・種類 | 情報収集 |

### 4.4 水分・睡眠・ストレス評価

| 項目 | 測定方法 | 目標値 |
|------|---------|--------|
| **水分摂取量** | 自己記録 | 体重×30-40ml |
| **睡眠時間** | 自己申告/ウェアラブル | 7-9時間 |
| **睡眠の質** | 質問票 | スコア化 |
| **ストレスレベル** | PSS（知覚ストレス尺度） | 低ストレス目標 |
| **カフェイン摂取** | 自己記録 | 400mg未満/日 |

---

## 5. 体組成評価（BODY COMPOSITION ASSESSMENT）

### 5.1 基本体組成

| 項目 | 測定機器 | 単位 | 評価ポイント |
|------|---------|------|-------------|
| **体重** | 体組成計 | kg | 基本指標 |
| **体脂肪率** | InBody/TANITA等 | % | 健康・美容指標 |
| **筋肉量** | 体組成計 | kg | トレーニング効果 |
| **骨格筋量** | 体組成計 | kg | 運動能力指標 |
| **体水分量** | 体組成計 | L / % | コンディション |
| **基礎代謝量** | 体組成計推定 | kcal | エネルギー管理 |
| **内臓脂肪レベル** | 体組成計 | レベル | 健康リスク |

### 5.2 部位別筋肉量分析

```
┌─────────────────────────────────────────────┐
│           部位別筋肉量バランス              │
├─────────────────────────────────────────────┤
│                                             │
│    右腕 ████████░░ 3.2kg    標準:3.0kg     │
│    左腕 ███████░░░ 2.9kg    標準:3.0kg     │
│    体幹 ████████████ 28.5kg 標準:26.0kg    │
│    右脚 █████████░ 9.8kg    標準:10.0kg    │
│    左脚 ██████████ 10.1kg   標準:10.0kg    │
│                                             │
│    左右バランス: 腕 90.6% / 脚 103.1%       │
│    → 左腕の強化を推奨                       │
└─────────────────────────────────────────────┘
```

### 5.3 体脂肪分布分析

| 部位 | 測定項目 | 評価ポイント |
|------|---------|-------------|
| **皮下脂肪（上半身）** | 上腕・背中・胸部 | 見た目の改善 |
| **皮下脂肪（下半身）** | 腹部・臀部・大腿 | ボディライン |
| **内臓脂肪** | 腹部CT相当推定 | 健康リスク |
| **体幹部脂肪** | 体幹の脂肪量 | メタボリスク |

### 5.4 代謝評価

| 項目 | 測定・計算方法 | 意味 |
|------|---------------|------|
| **基礎代謝量（BMR）** | 体組成計 or Harris-Benedict | 安静時消費カロリー |
| **TDEE** | BMR × 活動係数 | 1日総消費カロリー |
| **除脂肪体重（LBM）** | 体重 - 体脂肪量 | 代謝活性組織量 |
| **筋肉量/体重比** | 骨格筋量/体重 | 代謝効率 |
| **代謝年齢** | 同年代比較 | 代謝の若さ |

### 5.5 採寸データ

| 部位 | 測定箇所 | 目的 |
|------|---------|------|
| **胸囲** | 乳頭レベル | バストアップ/胸筋発達 |
| **ウエスト** | へそレベル | くびれ/腹筋発達 |
| **ヒップ** | 最大周囲 | ヒップアップ |
| **上腕囲** | 上腕二頭筋最大部 | 腕の発達 |
| **大腿囲** | 大腿中央 | 脚の発達 |
| **下腿囲** | ふくらはぎ最大部 | カーフの発達 |

---

## 6. アライメント評価（ALIGNMENT ASSESSMENT）

### 6.1 静的姿勢分析

#### 前額面（正面/背面）

| チェックポイント | 評価項目 | 関連する問題 |
|-----------------|---------|-------------|
| **頭部** | 傾き・回旋 | 頸部痛、頭痛 |
| **肩** | 高さの左右差 | 僧帽筋緊張、肩こり |
| **骨盤** | 高さの左右差 | 腰痛、脚長差 |
| **膝** | 内反/外反（O脚/X脚） | 膝痛、変形性関節症 |
| **足部** | 回内/回外 | 足底腱膜炎、外反母趾 |

#### 矢状面（側面）

| チェックポイント | 評価項目 | 関連する問題 |
|-----------------|---------|-------------|
| **頭部前方位置** | 耳垂と肩峰の位置関係 | 首こり、頭痛 |
| **頸椎** | 過前弯/ストレートネック | 肩こり、腕のしびれ |
| **胸椎** | 後弯増強（猫背） | 呼吸制限、肩こり |
| **腰椎** | 過前弯/フラットバック | 腰痛 |
| **骨盤** | 前傾/後傾角度 | 腰痛、股関節痛 |
| **膝** | 過伸展/屈曲位 | 膝痛 |

#### 姿勢タイプ分類

```typescript
type PostureType =
    | 'ideal'               // 理想的姿勢
    | 'kyphosis_lordosis'   // 猫背・反り腰型
    | 'flat_back'           // フラットバック型
    | 'sway_back'           // スウェイバック型
    | 'forward_head'        // 頭部前方型
    | 'military'            // ミリタリー型
    | 'combination';        // 複合型
```

### 6.2 動的動作分析

#### スクワットパターン分析

| 観察ポイント | 正常 | 異常パターン | 考えられる原因 |
|-------------|------|-------------|---------------|
| 膝の動き | まっすぐ | 内側に入る（Knee Valgus） | 臀筋弱化、内転筋過緊張 |
| 足部 | 安定 | 過回内 | 足部アーチ低下 |
| 体幹 | 直立維持 | 過度な前傾 | 足関節背屈制限 |
| 骨盤 | 安定 | バットウィンク | ハムストリングス短縮 |
| 腕の位置 | 上方維持 | 前方に落ちる | 胸椎可動域制限 |

#### オーバーヘッドリーチ分析

| 観察ポイント | 正常 | 異常パターン | 考えられる原因 |
|-------------|------|-------------|---------------|
| 腕の挙上 | 180°到達 | 制限あり | 肩関節/胸椎制限 |
| 腰椎 | 安定 | 過伸展 | 肩/胸椎代償 |
| 肋骨 | 安定 | 突出（リブフレア） | 腹筋群弱化 |

#### 歩行分析

| フェーズ | 観察項目 | 評価ポイント |
|---------|---------|-------------|
| 立脚期 | 足部接地パターン | ヒールストライク/ミッドフット/フォアフット |
| 立脚期 | 膝の安定性 | 過伸展/内反 |
| 遊脚期 | 股関節屈曲 | 歩幅 |
| 全体 | 骨盤の動き | 過度な傾斜/回旋 |
| 全体 | 腕振り | 左右対称性 |

### 6.3 左右差・非対称性評価

```typescript
interface AsymmetryAssessment {
    category: string;
    leftValue: number;
    rightValue: number;
    asymmetryPercent: number;  // |(L-R)|/avg × 100
    significance: 'normal' | 'moderate' | 'significant';
    recommendation: string;
}

// 評価基準
// 0-10%: normal（正常範囲）
// 10-15%: moderate（経過観察）
// 15%以上: significant（介入推奨）
```

### 6.4 機能障害スクリーニング

| テスト | 評価内容 | 陽性の意味 |
|--------|---------|-----------|
| **トーマステスト** | 腸腰筋短縮 | 股関節屈曲拘縮 |
| **オーバーテスト** | ITバンド短縮 | 膝外側痛リスク |
| **SLRテスト** | ハムストリングス短縮 | 腰痛リスク |
| **肩関節内旋テスト** | GIRD | 肩障害リスク |
| **足関節背屈テスト** | 背屈制限 | スクワット制限 |

---

## 7. データ構造（スキーマ設計）

### 7.1 データベーステーブル

```sql
-- ジム/施設情報
CREATE TABLE fitness_gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    gym_type VARCHAR(50),                          -- 'personal', 'boutique', 'medical', 'athlete'
    logo_url TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website TEXT,
    theme_color VARCHAR(7) DEFAULT '#1E40AF',
    -- 機能設定
    has_inbody BOOLEAN DEFAULT false,
    has_posture_analysis BOOLEAN DEFAULT false,
    has_nutrition_tracking BOOLEAN DEFAULT false,
    partner_id UUID REFERENCES partners(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- クライアント情報
CREATE TABLE fitness_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES fitness_gyms(id),
    client_number VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    furigana VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    birthdate DATE NOT NULL,
    gender VARCHAR(10),
    occupation VARCHAR(100),

    -- 基本身体情報
    height DECIMAL(5,1),

    -- 目標設定
    primary_goal VARCHAR(50),                      -- 'weight_loss', 'muscle_gain', 'health', 'performance', 'rehabilitation'
    target_weight DECIMAL(5,1),
    target_body_fat DECIMAL(4,1),
    target_deadline DATE,
    motivation_level INTEGER,                      -- 1-10

    -- 健康情報
    medical_history JSONB,
    current_medications JSONB,
    injuries JSONB,
    allergies TEXT,
    exercise_restrictions JSONB,

    -- 生活情報
    work_style VARCHAR(50),                        -- 'sedentary', 'standing', 'active', 'very_active'
    sleep_hours DECIMAL(3,1),
    stress_level INTEGER,                          -- 1-10

    -- ステータス
    membership_type VARCHAR(50),
    trainer_id UUID,
    status VARCHAR(20) DEFAULT 'active',
    joined_at DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 総合測定セッション
CREATE TABLE fitness_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES fitness_clients(id),
    gym_id UUID NOT NULL REFERENCES fitness_gyms(id),
    assessed_at DATE NOT NULL,
    assessment_type VARCHAR(20) DEFAULT 'full',    -- 'full', 'movement', 'nutrition', 'body', 'alignment'
    trainer_id UUID,

    -- 基本情報
    height DECIMAL(5,1),
    weight DECIMAL(5,1),

    -- 総合スコア
    overall_score INTEGER,                         -- 100点満点
    movement_score INTEGER,                        -- 運動評価スコア
    nutrition_score INTEGER,                       -- 栄養評価スコア
    body_composition_score INTEGER,                -- 体組成評価スコア
    alignment_score INTEGER,                       -- アライメント評価スコア

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 運動評価データ
CREATE TABLE movement_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES fitness_assessments(id),

    -- 筋力評価
    bench_press_1rm DECIMAL(5,1),
    squat_1rm DECIMAL(5,1),
    deadlift_1rm DECIMAL(5,1),
    pullup_reps INTEGER,
    pushup_reps INTEGER,
    plank_seconds INTEGER,
    single_leg_squat_left INTEGER,
    single_leg_squat_right INTEGER,
    grip_right DECIMAL(5,1),
    grip_left DECIMAL(5,1),

    -- 可動域（度数）
    shoulder_flexion_left INTEGER,
    shoulder_flexion_right INTEGER,
    shoulder_external_rotation_left INTEGER,
    shoulder_external_rotation_right INTEGER,
    shoulder_internal_rotation_left INTEGER,
    shoulder_internal_rotation_right INTEGER,
    hip_flexion_left INTEGER,
    hip_flexion_right INTEGER,
    hip_abduction_left INTEGER,
    hip_abduction_right INTEGER,
    hip_internal_rotation_left INTEGER,
    hip_internal_rotation_right INTEGER,
    hip_external_rotation_left INTEGER,
    hip_external_rotation_right INTEGER,
    ankle_dorsiflexion_left INTEGER,
    ankle_dorsiflexion_right INTEGER,
    thoracic_rotation_left INTEGER,
    thoracic_rotation_right INTEGER,
    slr_left INTEGER,
    slr_right INTEGER,

    -- 心肺機能
    vo2max_estimated DECIMAL(5,1),
    resting_heart_rate INTEGER,
    heart_rate_recovery INTEGER,
    lactate_threshold_hr INTEGER,

    -- FMS
    fms_total_score INTEGER,
    fms_deep_squat INTEGER,
    fms_hurdle_step_left INTEGER,
    fms_hurdle_step_right INTEGER,
    fms_inline_lunge_left INTEGER,
    fms_inline_lunge_right INTEGER,
    fms_shoulder_mobility_left INTEGER,
    fms_shoulder_mobility_right INTEGER,
    fms_active_slr_left INTEGER,
    fms_active_slr_right INTEGER,
    fms_trunk_stability_pushup INTEGER,
    fms_rotary_stability_left INTEGER,
    fms_rotary_stability_right INTEGER,

    -- Yバランステスト
    y_balance_anterior_left INTEGER,
    y_balance_anterior_right INTEGER,
    y_balance_posteromedial_left INTEGER,
    y_balance_posteromedial_right INTEGER,
    y_balance_posterolateral_left INTEGER,
    y_balance_posterolateral_right INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 栄養評価データ
CREATE TABLE nutrition_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES fitness_assessments(id),

    -- 記録期間
    recording_period_days INTEGER,
    recording_start_date DATE,
    recording_end_date DATE,

    -- マクロ栄養素（1日平均）
    avg_calories INTEGER,
    avg_protein DECIMAL(5,1),
    avg_fat DECIMAL(5,1),
    avg_carbs DECIMAL(5,1),
    avg_fiber DECIMAL(4,1),
    avg_sugar DECIMAL(5,1),

    -- PFCバランス
    protein_ratio DECIMAL(4,1),
    fat_ratio DECIMAL(4,1),
    carbs_ratio DECIMAL(4,1),

    -- ミクロ栄養素充足率（%）
    vitamin_a_percent INTEGER,
    vitamin_b1_percent INTEGER,
    vitamin_b2_percent INTEGER,
    vitamin_b6_percent INTEGER,
    vitamin_b12_percent INTEGER,
    vitamin_c_percent INTEGER,
    vitamin_d_percent INTEGER,
    vitamin_e_percent INTEGER,
    folate_percent INTEGER,
    calcium_percent INTEGER,
    iron_percent INTEGER,
    magnesium_percent INTEGER,
    zinc_percent INTEGER,
    potassium_percent INTEGER,
    sodium_mg INTEGER,

    -- 食習慣スコア
    meal_regularity_score INTEGER,
    meal_timing_score INTEGER,
    chewing_score INTEGER,
    eating_out_frequency INTEGER,
    snacking_score INTEGER,
    alcohol_score INTEGER,

    -- 水分・睡眠・ストレス
    water_intake_ml INTEGER,
    sleep_hours DECIMAL(3,1),
    sleep_quality_score INTEGER,
    stress_score INTEGER,
    caffeine_mg INTEGER,

    -- サプリメント
    supplements_used JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 体組成評価データ
CREATE TABLE body_composition_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES fitness_assessments(id),

    -- 基本体組成
    weight DECIMAL(5,1),
    body_fat_percentage DECIMAL(4,1),
    muscle_mass DECIMAL(5,1),
    skeletal_muscle_mass DECIMAL(5,1),
    body_water DECIMAL(5,1),
    body_water_percentage DECIMAL(4,1),
    bmr INTEGER,
    visceral_fat_level INTEGER,

    -- 部位別筋肉量
    muscle_mass_right_arm DECIMAL(4,1),
    muscle_mass_left_arm DECIMAL(4,1),
    muscle_mass_trunk DECIMAL(5,1),
    muscle_mass_right_leg DECIMAL(5,1),
    muscle_mass_left_leg DECIMAL(5,1),

    -- 部位別体脂肪
    fat_mass_right_arm DECIMAL(4,1),
    fat_mass_left_arm DECIMAL(4,1),
    fat_mass_trunk DECIMAL(5,1),
    fat_mass_right_leg DECIMAL(5,1),
    fat_mass_left_leg DECIMAL(5,1),

    -- 採寸
    chest_circumference DECIMAL(5,1),
    waist_circumference DECIMAL(5,1),
    hip_circumference DECIMAL(5,1),
    right_arm_circumference DECIMAL(5,1),
    left_arm_circumference DECIMAL(5,1),
    right_thigh_circumference DECIMAL(5,1),
    left_thigh_circumference DECIMAL(5,1),
    right_calf_circumference DECIMAL(5,1),
    left_calf_circumference DECIMAL(5,1),

    -- 代謝評価
    tdee_estimated INTEGER,
    metabolic_age INTEGER,

    -- 測定機器情報
    measurement_device VARCHAR(100),               -- 'InBody770', 'TANITA MC-980A', etc.

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- アライメント評価データ
CREATE TABLE alignment_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES fitness_assessments(id),

    -- 静的姿勢（前額面）
    head_tilt VARCHAR(20),                         -- 'neutral', 'left', 'right'
    head_tilt_degree INTEGER,
    shoulder_height_diff INTEGER,                  -- mm（右-左）
    pelvis_height_diff INTEGER,
    knee_alignment VARCHAR(20),                    -- 'neutral', 'varus', 'valgus'
    foot_alignment VARCHAR(20),                    -- 'neutral', 'pronation', 'supination'

    -- 静的姿勢（矢状面）
    head_forward_position INTEGER,                 -- mm
    cervical_curve VARCHAR(20),                    -- 'normal', 'hyper', 'straight'
    thoracic_curve VARCHAR(20),                    -- 'normal', 'hyper', 'flat'
    lumbar_curve VARCHAR(20),                      -- 'normal', 'hyper', 'flat'
    pelvic_tilt VARCHAR(20),                       -- 'neutral', 'anterior', 'posterior'
    pelvic_tilt_degree INTEGER,
    knee_position VARCHAR(20),                     -- 'neutral', 'hyperextension', 'flexion'

    -- 姿勢タイプ
    posture_type VARCHAR(50),

    -- 動的評価（スクワット）
    squat_knee_valgus BOOLEAN,
    squat_foot_pronation BOOLEAN,
    squat_trunk_forward_lean BOOLEAN,
    squat_butt_wink BOOLEAN,
    squat_arm_fall BOOLEAN,

    -- 動的評価（オーバーヘッド）
    overhead_reach_limited BOOLEAN,
    overhead_lumbar_hyperextension BOOLEAN,
    overhead_rib_flare BOOLEAN,

    -- 歩行パターン
    gait_pattern_notes TEXT,

    -- 機能障害テスト
    thomas_test_left VARCHAR(20),                  -- 'negative', 'positive'
    thomas_test_right VARCHAR(20),
    ober_test_left VARCHAR(20),
    ober_test_right VARCHAR(20),
    slr_test_left VARCHAR(20),
    slr_test_right VARCHAR(20),

    -- 左右非対称性評価
    asymmetry_findings JSONB,

    -- 写真URL
    front_photo_url TEXT,
    side_photo_url TEXT,
    back_photo_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 診断結果
CREATE TABLE fitness_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES fitness_assessments(id),

    -- 総合評価
    overall_score INTEGER,
    overall_grade VARCHAR(10),
    fitness_age INTEGER,

    -- カテゴリ別スコア
    movement_score INTEGER,
    nutrition_score INTEGER,
    body_composition_score INTEGER,
    alignment_score INTEGER,

    -- 詳細スコア（JSONB）
    detailed_scores JSONB,

    -- 強み・弱み
    strengths JSONB,
    weaknesses JSONB,

    -- 優先改善項目
    priority_improvements JSONB,

    -- 推奨トレーニングプログラム
    recommended_program JSONB,

    -- 栄養アドバイス
    nutrition_advice JSONB,

    -- 姿勢改善アドバイス
    posture_advice JSONB,

    -- 目標達成予測
    goal_prediction JSONB,

    -- ケガリスク
    injury_risks JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- トレーニングプログラム
CREATE TABLE training_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES fitness_clients(id),
    result_id UUID REFERENCES fitness_results(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    goal VARCHAR(50),
    duration_weeks INTEGER,
    sessions_per_week INTEGER,
    program_structure JSONB,                       -- 週ごとのメニュー構成
    created_by UUID,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- セッション記録
CREATE TABLE training_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES fitness_clients(id),
    program_id UUID REFERENCES training_programs(id),
    session_date TIMESTAMP NOT NULL,
    trainer_id UUID,
    session_type VARCHAR(50),                      -- 'personal', 'group', 'self'
    duration_minutes INTEGER,
    exercises JSONB,                               -- [{exercise, sets, reps, weight, notes}]
    cardio JSONB,                                  -- [{type, duration, distance, heart_rate}]
    notes TEXT,
    client_feedback TEXT,
    trainer_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 進捗写真
CREATE TABLE progress_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES fitness_clients(id),
    photo_date DATE NOT NULL,
    photo_type VARCHAR(20),                        -- 'front', 'side', 'back'
    photo_url TEXT NOT NULL,
    weight DECIMAL(5,1),
    body_fat_percentage DECIMAL(4,1),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. 診断ロジック

### 8.1 総合スコア計算

```typescript
interface FitnessScores {
    overall: number;           // 100点満点
    movement: number;
    nutrition: number;
    bodyComposition: number;
    alignment: number;
}

function calculateOverallScore(
    movementScore: number,
    nutritionScore: number,
    bodyCompositionScore: number,
    alignmentScore: number,
    clientGoal: ClientGoal
): FitnessScores {
    // 目標に応じた重み付け
    const weights = getGoalWeights(clientGoal);

    const overall = Math.round(
        movementScore * weights.movement +
        nutritionScore * weights.nutrition +
        bodyCompositionScore * weights.bodyComposition +
        alignmentScore * weights.alignment
    );

    return {
        overall,
        movement: movementScore,
        nutrition: nutritionScore,
        bodyComposition: bodyCompositionScore,
        alignment: alignmentScore
    };
}

// 目標別の重み
const goalWeights: Record<ClientGoal, Weights> = {
    weight_loss: {
        movement: 0.20,
        nutrition: 0.35,
        bodyComposition: 0.35,
        alignment: 0.10
    },
    muscle_gain: {
        movement: 0.35,
        nutrition: 0.30,
        bodyComposition: 0.25,
        alignment: 0.10
    },
    health: {
        movement: 0.25,
        nutrition: 0.25,
        bodyComposition: 0.25,
        alignment: 0.25
    },
    performance: {
        movement: 0.40,
        nutrition: 0.20,
        bodyComposition: 0.20,
        alignment: 0.20
    },
    rehabilitation: {
        movement: 0.25,
        nutrition: 0.15,
        bodyComposition: 0.15,
        alignment: 0.45
    }
};
```

### 8.2 運動評価スコア計算

```typescript
function calculateMovementScore(data: MovementAssessment): number {
    const strengthScore = calculateStrengthScore(data);
    const mobilityScore = calculateMobilityScore(data);
    const cardioScore = calculateCardioScore(data);
    const functionalScore = calculateFunctionalScore(data);

    return Math.round(
        strengthScore * 0.30 +
        mobilityScore * 0.25 +
        cardioScore * 0.20 +
        functionalScore * 0.25
    );
}

// 筋力スコア（相対筋力で評価）
function calculateStrengthScore(data: MovementAssessment): number {
    const bodyWeight = data.weight;

    // 相対筋力（体重比）で評価
    const benchRatio = data.bench_press_1rm / bodyWeight;
    const squatRatio = data.squat_1rm / bodyWeight;
    const deadliftRatio = data.deadlift_1rm / bodyWeight;

    // 性別・年齢別の基準値と比較
    // ... スコア計算ロジック

    return score;
}
```

### 8.3 栄養評価スコア計算

```typescript
function calculateNutritionScore(data: NutritionAssessment, client: FitnessClient): number {
    const macroScore = calculateMacroScore(data, client);
    const microScore = calculateMicroScore(data);
    const habitScore = calculateHabitScore(data);
    const lifestyleScore = calculateLifestyleScore(data);

    return Math.round(
        macroScore * 0.35 +
        microScore * 0.20 +
        habitScore * 0.25 +
        lifestyleScore * 0.20
    );
}

// マクロ栄養素スコア
function calculateMacroScore(data: NutritionAssessment, client: FitnessClient): number {
    const targetCalories = calculateTDEE(client) * getGoalMultiplier(client.primary_goal);
    const targetProtein = client.weight * getProteinMultiplier(client.primary_goal);

    // 目標との乖離でスコア化
    const calorieDeviation = Math.abs(data.avg_calories - targetCalories) / targetCalories;
    const proteinDeviation = Math.abs(data.avg_protein - targetProtein) / targetProtein;

    // ... スコア計算
}
```

### 8.4 体組成評価スコア計算

```typescript
function calculateBodyCompositionScore(
    data: BodyCompositionAssessment,
    client: FitnessClient
): number {
    const fatScore = calculateBodyFatScore(data, client);
    const muscleScore = calculateMuscleScore(data, client);
    const balanceScore = calculateBodyBalanceScore(data);
    const metabolicScore = calculateMetabolicScore(data, client);

    return Math.round(
        fatScore * 0.30 +
        muscleScore * 0.30 +
        balanceScore * 0.20 +
        metabolicScore * 0.20
    );
}

// 部位バランススコア
function calculateBodyBalanceScore(data: BodyCompositionAssessment): number {
    // 左右差の評価
    const armAsymmetry = Math.abs(
        data.muscle_mass_right_arm - data.muscle_mass_left_arm
    ) / ((data.muscle_mass_right_arm + data.muscle_mass_left_arm) / 2) * 100;

    const legAsymmetry = Math.abs(
        data.muscle_mass_right_leg - data.muscle_mass_left_leg
    ) / ((data.muscle_mass_right_leg + data.muscle_mass_left_leg) / 2) * 100;

    // 非対称性が小さいほど高スコア
    // ...
}
```

### 8.5 アライメント評価スコア計算

```typescript
function calculateAlignmentScore(data: AlignmentAssessment): number {
    const staticScore = calculateStaticPostureScore(data);
    const dynamicScore = calculateDynamicPatternScore(data);
    const functionalScore = calculateFunctionalTestScore(data);
    const asymmetryScore = calculateAsymmetryScore(data);

    return Math.round(
        staticScore * 0.30 +
        dynamicScore * 0.30 +
        functionalScore * 0.25 +
        asymmetryScore * 0.15
    );
}
```

### 8.6 パーソナライズドプログラム生成

```typescript
interface PersonalizedProgram {
    name: string;
    overview: string;
    duration: number;           // 週数
    sessionsPerWeek: number;
    focus: string[];           // 重点改善項目
    weeklySchedule: WeeklySchedule;
    nutritionPlan: NutritionPlan;
    progressMilestones: Milestone[];
}

function generatePersonalizedProgram(
    result: FitnessResult,
    client: FitnessClient
): PersonalizedProgram {
    // 弱点の特定
    const weaknesses = identifyWeaknesses(result);

    // 優先順位付け
    const priorities = prioritizeImprovements(weaknesses, client.primary_goal);

    // トレーニングプログラム生成
    const trainingPlan = generateTrainingPlan(priorities, client);

    // 栄養プラン生成
    const nutritionPlan = generateNutritionPlan(result.nutrition, client);

    // 姿勢改善プログラム
    const postureProgram = generatePostureProgram(result.alignment);

    return {
        name: `${client.name}様専用プログラム`,
        overview: generateProgramOverview(priorities),
        duration: calculateProgramDuration(priorities),
        sessionsPerWeek: determinSessionFrequency(client),
        focus: priorities.map(p => p.area),
        weeklySchedule: mergeSchedules(trainingPlan, postureProgram),
        nutritionPlan,
        progressMilestones: generateMilestones(client, priorities)
    };
}
```

---

## 9. 結果出力（レポート）

### 9.1 詳細レポート構成

#### ページ1: エグゼクティブサマリー
- 4軸レーダーチャート
- 総合スコア・グレード
- フィットネス年齢
- 今回のハイライト

#### ページ2-3: 運動評価詳細
- 筋力プロファイル
- 可動域マップ
- 心肺機能グラフ
- FMSスコア詳細

#### ページ4: 栄養評価詳細
- マクロ栄養素バランス
- ミクロ栄養素充足率
- 食習慣スコア
- 改善ポイント

#### ページ5: 体組成評価詳細
- ボディコンポジションチャート
- 部位別筋肉量グラフ
- 体脂肪分布
- 代謝評価

#### ページ6: アライメント評価詳細
- 姿勢写真と分析結果
- 動作パターン評価
- 左右差分析
- 機能障害マップ

#### ページ7-8: パーソナライズドプログラム
- 週間トレーニングスケジュール
- 推奨エクササイズ（動画QRコード付き）
- 栄養目標と食事例
- 姿勢改善エクササイズ

#### ページ9: ゴール達成ロードマップ
- 短期目標（1ヶ月）
- 中期目標（3ヶ月）
- 長期目標（6ヶ月）
- 予測進捗グラフ

---

## 10. 機能一覧

### 10.1 クライアント向け機能

| 機能 | 説明 |
|------|------|
| **マイページ** | 測定履歴、進捗、次回予約 |
| **レポート閲覧** | 詳細な診断レポートをスマホで確認 |
| **ビフォーアフター** | 進捗写真の比較表示 |
| **トレーニング記録** | セッションの記録・振り返り |
| **食事記録** | 写真/入力による食事ログ |
| **体重・体組成記録** | 日々の変化をトラッキング |
| **エクササイズ動画** | 推奨エクササイズの動画ライブラリ |
| **チャット** | トレーナーとのメッセージング |

### 10.2 トレーナー向け機能

| 機能 | 説明 |
|------|------|
| **クライアント管理** | 担当クライアントの一覧・詳細 |
| **測定入力** | 4軸評価データの効率的な入力 |
| **プログラム作成** | AIアシストによるプログラム生成 |
| **セッション記録** | トレーニング内容の記録 |
| **進捗分析** | クライアントの進捗グラフ |
| **アラート** | 停滞・リスクの自動検知 |
| **レポート発行** | PDF/印刷用レポート生成 |

### 10.3 ジムオーナー/マネージャー向け機能

| 機能 | 説明 |
|------|------|
| **ダッシュボード** | 全体の稼働状況・KPI |
| **トレーナー管理** | スタッフアカウントの管理 |
| **クライアント統計** | 会員の傾向分析 |
| **継続率分析** | リテンション分析 |
| **売上分析** | 診断オプションの売上 |
| **比較分析** | トレーナー間の成果比較 |

---

## 11. 技術仕様

### 11.1 フロントエンド
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Recharts / D3.js（グラフ）
- Three.js（3D姿勢表示オプション）
- PWA対応

### 11.2 バックエンド
- Supabase (PostgreSQL + Auth + Storage)
- Next.js API Routes
- Edge Functions
- OpenAI API（栄養分析AI、プログラム生成）

### 11.3 外部連携
- InBody API / TANITA API（体組成計）
- MyFitnessPal API（栄養記録）
- Apple Watch / Fitbit（心拍・活動量）
- Kinovea / Dartfish（動画分析）
- LINE通知
- Zoom（オンラインセッション）

---

## 12. 料金プラン（想定）

### 12.1 ジム向けライセンス

| プラン | 月額 | トレーナー数 | クライアント数 | 機能 |
|--------|------|------------|--------------|------|
| **スターター** | ¥29,800 | 2名 | 50名 | 基本4軸評価 |
| **プロフェッショナル** | ¥59,800 | 5名 | 150名 | 全機能 |
| **エンタープライズ** | ¥99,800 | 無制限 | 無制限 | 全機能+API+優先サポート |
| **カスタム** | 要相談 | - | - | ホワイトラベル対応 |

### 12.2 オプション

| オプション | 月額 | 内容 |
|-----------|------|------|
| **AI栄養分析** | +¥9,800 | 写真からの栄養素自動解析 |
| **3D姿勢分析** | +¥14,800 | 3Dモデルによる姿勢可視化 |
| **動画分析連携** | +¥9,800 | Kinovea等との連携 |
| **体組成計連携** | +¥4,800 | InBody/TANITA直接連携 |

---

## 13. 今後の展開

### Phase 1（初期リリース）
- 4軸評価の基本機能
- レポート生成
- クライアント・トレーナー管理

### Phase 2
- AI活用の栄養分析
- 自動プログラム生成
- 体組成計との連携

### Phase 3
- 動画による動作分析AI
- 3D姿勢モデリング
- ウェアラブルデバイス連携

### Phase 4
- 予測分析（目標達成確率）
- パーソナルAIトレーナー
- VRトレーニング連携

---

## 付録A: 評価基準の詳細

### 筋力評価基準（相対筋力：体重比）

#### ベンチプレス1RM

| レベル | 男性 | 女性 |
|--------|------|------|
| 初心者 | 0.5未満 | 0.25未満 |
| 中級者 | 0.5-1.0 | 0.25-0.5 |
| 上級者 | 1.0-1.5 | 0.5-0.75 |
| エリート | 1.5以上 | 0.75以上 |

#### スクワット1RM

| レベル | 男性 | 女性 |
|--------|------|------|
| 初心者 | 0.75未満 | 0.5未満 |
| 中級者 | 0.75-1.5 | 0.5-1.0 |
| 上級者 | 1.5-2.0 | 1.0-1.5 |
| エリート | 2.0以上 | 1.5以上 |

### 体脂肪率基準

| カテゴリ | 男性 | 女性 |
|---------|------|------|
| アスリート | 6-13% | 14-20% |
| フィットネス | 14-17% | 21-24% |
| 標準 | 18-24% | 25-31% |
| 肥満 | 25%以上 | 32%以上 |

---

## 付録B: FMS（Functional Movement Screen）評価基準

| テスト | 0点 | 1点 | 2点 | 3点 |
|--------|-----|-----|-----|-----|
| ディープスクワット | 痛み | 補助あり不可 | 補助あり可 | 補助なし可 |
| ハードルステップ | 痛み | 接触/姿勢崩壊 | 代償動作あり | 理想的 |
| インラインランジ | 痛み | バランス喪失 | 代償動作あり | 理想的 |
| ショルダーモビリティ | 痛み | 拳2つ以上 | 拳1.5以内 | 拳1つ以内 |
| アクティブSLR | 痛み | 膝下 | 膝-大腿中央 | 大腿中央以上 |
| 体幹安定性プッシュアップ | 痛み | 不可 | 代償あり | 理想的 |
| ロータリースタビリティ | 痛み | 不可 | 対角不可 | 対角可 |

---

*NOBISHIRO FITNESS 仕様書 v1.0*
*作成日: 2025年12月17日*
