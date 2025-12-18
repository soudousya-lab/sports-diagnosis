# NOBISHIRO HEALTH 仕様書

## 大人向け健康・フィットネス診断システム

---

## 1. システム概要

### 1.1 コンセプト

**NOBISHIRO HEALTH**は、成人（18歳以上）を対象とした健康・フィットネス診断システムです。体力年齢の測定、生活習慣病予防、運動習慣の定着をサポートし、「健康寿命の延伸」を目指します。

フィットネスクラブ、企業の健康経営、自治体の健康増進事業、医療機関のリハビリ部門など、多様な事業者が活用できるプラットフォームです。

### 1.2 ターゲットユーザー

| ユーザー種別 | 説明 |
|------------|------|
| **フィットネス施設** | スポーツジム、フィットネスクラブ、パーソナルジム |
| **企業** | 健康経営推進企業、人事・総務部門 |
| **自治体** | 健康増進課、地域包括支援センター |
| **医療機関** | リハビリテーション科、整形外科 |
| **個人ユーザー** | 健康意識の高い成人（18〜80歳以上） |

### 1.3 NOBISHIROシリーズとの違い

| 項目 | KIDS | ATHLETE | HEALTH |
|------|------|---------|--------|
| 対象年齢 | 5〜12歳 | 12〜18歳 | 18〜80歳以上 |
| 目的 | スポーツ適性発見 | パフォーマンス向上 | 健康維持・増進 |
| 測定項目 | 7項目 | 12項目 | 10項目+健康指標 |
| 評価軸 | 運動能力 | 競技能力 | 体力年齢・健康リスク |
| 出力 | 適性スポーツ | トレーニング計画 | 生活改善・運動処方 |

---

## 2. 測定項目

### 2.1 基礎運動能力測定（8項目）

人間の運動の基本となる「走る」「跳ぶ」「投げる」「支える」「バランス」などの基礎運動能力を評価します。

#### 移動系基礎運動（3項目）

| No | 項目 | 計測内容 | 単位 | 評価する基礎運動 | 日常生活との関連 |
|----|------|---------|------|-----------------|----------------|
| 1 | **10m歩行** | 通常歩行速度での10m歩行時間 | 秒 | 歩く | 移動能力、転倒リスク |
| 2 | **10m走** | 最大努力での10m走タイム | 秒 | 走る | 緊急時の俊敏性 |
| 3 | **階段昇降** | 10段の階段を昇り降りする時間 | 秒 | 昇り降り | 日常の移動、下肢筋力 |

#### 跳躍系基礎運動（2項目）

| No | 項目 | 計測内容 | 単位 | 評価する基礎運動 | 日常生活との関連 |
|----|------|---------|------|-----------------|----------------|
| 4 | **立ち幅跳び** | 両足踏切での跳躍距離 | cm | 跳ぶ（水平） | 瞬発力、障害物回避 |
| 5 | **垂直跳び** | その場での垂直跳躍高 | cm | 跳ぶ（垂直） | 瞬発力、転倒時の立ち直り |

#### 操作系基礎運動（2項目）

| No | 項目 | 計測内容 | 単位 | 評価する基礎運動 | 日常生活との関連 |
|----|------|---------|------|-----------------|----------------|
| 6 | **ボール投げ** | テニスボールの投擲距離 | m | 投げる | 上半身連動、物を扱う力 |
| 7 | **握力** | 左右の握力 | kg | つかむ・握る | 物を持つ、瓶を開ける |

#### 姿勢制御系基礎運動（1項目）

| No | 項目 | 計測内容 | 単位 | 評価する基礎運動 | 日常生活との関連 |
|----|------|---------|------|-----------------|----------------|
| 8 | **片足立ち** | 開眼・閉眼での保持時間 | 秒 | バランス | 転倒予防、靴を履く動作 |

---

### 2.2 体力測定項目（12項目）

#### 筋力・パワー系（4項目）

| No | 項目 | 計測内容 | 単位 | 対象能力 |
|----|------|---------|------|---------|
| 1 | **握力** | 左右の握力の平均 | kg | 上肢筋力 |
| 2 | **上体起こし** | 30秒間の回数 | 回 | 腹筋力・体幹 |
| 3 | **立ち幅跳び** | 両足踏切での跳躍距離 | cm | 下肢瞬発力 |
| 4 | **背筋力** | 背筋力計での測定 | kg | 体幹・背筋力 |

#### 柔軟性・バランス系（4項目）

| No | 項目 | 計測内容 | 単位 | 対象能力 |
|----|------|---------|------|---------|
| 5 | **長座体前屈** | 座位での前屈距離 | cm | ハムストリングス柔軟性 |
| 6 | **開眼片足立ち** | 片足立ちの保持時間 | 秒 | 静的バランス |
| 7 | **閉眼片足立ち** | 目を閉じて片足立ち | 秒 | 固有感覚・前庭機能 |
| 8 | **ファンクショナルリーチ** | 前方への最大リーチ距離 | cm | 動的バランス |

#### 持久力・敏捷性系（4項目）

| No | 項目 | 計測内容 | 単位 | 対象能力 |
|----|------|---------|------|---------|
| 9 | **反復横跳び** | 20秒間の回数 | 回 | 敏捷性 |
| 10 | **20mシャトルラン** | 往復回数（最大心拍到達まで） | 回 | 全身持久力（VO2max推定） |
| 11 | **6分間歩行** | 6分間の歩行距離 | m | 持久力（高齢者向け） |
| 12 | **TUG（Timed Up & Go）** | 椅子からの立ち上がり〜歩行〜着座 | 秒 | 機能的移動能力 |

### 2.3 健康関連指標

| No | 項目 | 内容 | 評価対象 |
|----|------|-----|---------|
| 11 | **BMI** | 体重(kg) / 身長(m)² | 体格 |
| 12 | **体脂肪率** | 体脂肪量 / 体重 × 100 | 体組成 |
| 13 | **腹囲** | へそ周りの周囲長 | 内臓脂肪 |
| 14 | **血圧** | 収縮期/拡張期血圧 | 循環器 |
| 15 | **安静時心拍数** | 1分間の心拍数 | 心肺機能 |

### 2.3 生活習慣アンケート

| カテゴリ | 質問項目例 |
|---------|-----------|
| **運動習慣** | 週の運動頻度、1回の運動時間、運動強度 |
| **食事習慣** | 食事回数、野菜摂取、間食頻度 |
| **睡眠** | 睡眠時間、睡眠の質、起床時の疲労感 |
| **飲酒・喫煙** | 飲酒頻度・量、喫煙有無 |
| **ストレス** | ストレス度、リラックス方法 |
| **既往歴** | 持病、服薬状況、過去のケガ |

### 2.4 測定モード

| モード | 対象 | 測定項目 | 所要時間 |
|--------|------|---------|---------|
| **簡易チェック** | 一般成人 | 5項目 + BMI | 約15分 |
| **スタンダード** | フィットネス会員 | 10項目 + 健康指標 | 約30分 |
| **プレミアム** | 企業健康診断 | 全項目 + アンケート | 約45分 |
| **シニア向け** | 65歳以上 | 7項目（安全性重視） | 約20分 |

---

## 3. データ構造（スキーマ設計）

### 3.1 データベーステーブル

```sql
-- 施設/事業者情報
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,                    -- 施設名
    slug VARCHAR(100) UNIQUE NOT NULL,             -- URL用スラッグ
    facility_type VARCHAR(50),                     -- 'gym', 'corporate', 'municipality', 'medical'
    logo_url TEXT,
    prefecture VARCHAR(50),
    city VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website TEXT,
    theme_color VARCHAR(7) DEFAULT '#2563EB',
    partner_id UUID REFERENCES partners(id),
    -- 企業向け設定
    company_name VARCHAR(200),
    employee_count INTEGER,
    industry VARCHAR(100),
    -- 自治体向け設定
    municipality_code VARCHAR(10),
    -- 医療機関向け設定
    medical_license VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 利用者情報
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id),
    member_number VARCHAR(50),                     -- 会員番号
    name VARCHAR(100) NOT NULL,
    furigana VARCHAR(100),
    birthdate DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    height DECIMAL(5,1),                           -- cm
    weight DECIMAL(5,1),                           -- kg

    -- 身体情報
    body_fat_percentage DECIMAL(4,1),              -- 体脂肪率
    waist_circumference DECIMAL(5,1),              -- 腹囲 cm
    blood_pressure_systolic INTEGER,               -- 収縮期血圧
    blood_pressure_diastolic INTEGER,              -- 拡張期血圧
    resting_heart_rate INTEGER,                    -- 安静時心拍数

    -- 健康情報
    medical_conditions JSONB,                      -- 既往歴・持病
    medications JSONB,                             -- 服薬情報
    allergies TEXT,                                -- アレルギー
    emergency_contact JSONB,                       -- 緊急連絡先

    -- 運動制限
    exercise_restrictions JSONB,                   -- 運動制限事項
    doctor_clearance BOOLEAN DEFAULT false,        -- 医師の運動許可

    -- ステータス
    membership_type VARCHAR(50),                   -- 会員種別
    status VARCHAR(20) DEFAULT 'active',
    joined_at DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 測定記録
CREATE TABLE health_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id),
    facility_id UUID NOT NULL REFERENCES facilities(id),
    measured_at DATE NOT NULL,
    mode VARCHAR(20) DEFAULT 'standard',           -- 'simple', 'standard', 'premium', 'senior'

    -- 基本情報（測定時点）
    height DECIMAL(5,1),
    weight DECIMAL(5,1),
    bmi DECIMAL(4,1),
    body_fat_percentage DECIMAL(4,1),
    waist_circumference DECIMAL(5,1),

    -- 体力測定
    grip_right DECIMAL(5,1),                       -- kg
    grip_left DECIMAL(5,1),                        -- kg
    sit_ups INTEGER,                               -- 回（30秒）
    standing_jump INTEGER,                         -- cm
    sit_and_reach INTEGER,                         -- cm
    single_leg_balance_open INTEGER,               -- 秒（開眼）
    single_leg_balance_closed INTEGER,             -- 秒（閉眼）
    side_step INTEGER,                             -- 回（20秒）
    shuttle_run INTEGER,                           -- 回
    six_min_walk INTEGER,                          -- m
    stepping INTEGER,                              -- 回（10秒）

    -- バイタル
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,

    -- 生活習慣アンケート
    lifestyle_survey JSONB,

    -- メタ情報
    measured_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 診断結果
CREATE TABLE health_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    measurement_id UUID NOT NULL REFERENCES health_measurements(id),

    -- 体力年齢
    fitness_age DECIMAL(4,1),                      -- 体力年齢
    fitness_age_diff DECIMAL(4,1),                 -- 実年齢との差

    -- 総合スコア
    overall_score INTEGER,                         -- 100点満点
    overall_grade VARCHAR(10),                     -- 'A', 'B', 'C', 'D', 'E'

    -- カテゴリ別スコア
    category_scores JSONB,                         -- {strength: 72, flexibility: 58, ...}

    -- 各項目スコア
    item_scores JSONB,                             -- {grip: 7, sit_and_reach: 5, ...}

    -- 健康リスク評価
    health_risks JSONB,                            -- [{type: "metabolic", level: "medium", ...}]

    -- ロコモ度チェック
    locomotive_syndrome_risk VARCHAR(20),          -- 'none', 'risk1', 'risk2'

    -- フレイル判定（高齢者）
    frailty_status VARCHAR(20),                    -- 'robust', 'pre_frail', 'frail'

    -- 推奨運動プログラム
    recommended_programs JSONB,

    -- 生活改善アドバイス
    lifestyle_advice JSONB,

    -- 目標設定
    goals JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 運動プログラム
CREATE TABLE exercise_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,                 -- 'strength', 'cardio', 'flexibility', 'balance'
    target_ability VARCHAR(50),                    -- 対象能力
    age_group VARCHAR(20),                         -- 'young_adult', 'middle_age', 'senior'
    fitness_level VARCHAR(20),                     -- 'beginner', 'intermediate', 'advanced'
    name VARCHAR(200) NOT NULL,
    description TEXT,
    duration VARCHAR(50),                          -- 所要時間
    frequency VARCHAR(50),                         -- 推奨頻度
    reps VARCHAR(100),
    sets INTEGER,
    intensity VARCHAR(50),                         -- 強度
    video_url TEXT,
    image_url TEXT,
    calories_burned INTEGER,                       -- 消費カロリー目安
    equipment TEXT[],                              -- 必要器具
    contraindications TEXT[],                      -- 禁忌事項
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 運動記録（トラッキング）
CREATE TABLE exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id),
    logged_at TIMESTAMP NOT NULL,
    exercise_type VARCHAR(100),                    -- 運動種類
    duration INTEGER,                              -- 分
    intensity VARCHAR(20),                         -- 'light', 'moderate', 'vigorous'
    calories_burned INTEGER,
    heart_rate_avg INTEGER,
    heart_rate_max INTEGER,
    notes TEXT,
    program_id UUID REFERENCES exercise_programs(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 目標・進捗管理
CREATE TABLE health_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id),
    goal_type VARCHAR(50),                         -- 'weight', 'body_fat', 'fitness_age', 'exercise_habit'
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    target_date DATE,
    status VARCHAR(20) DEFAULT 'active',           -- 'active', 'achieved', 'abandoned'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 企業向け: 部署情報
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES departments(id),     -- 階層構造対応
    manager_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 企業向け: 従業員と部署の紐付け
CREATE TABLE member_departments (
    member_id UUID REFERENCES members(id),
    department_id UUID REFERENCES departments(id),
    PRIMARY KEY (member_id, department_id)
);
```

### 3.2 型定義（TypeScript）

```typescript
// 年齢区分
export type AgeGroup =
    | 'young_adult'    // 18-39歳
    | 'middle_age'     // 40-64歳
    | 'young_senior'   // 65-74歳
    | 'senior';        // 75歳以上

// 施設タイプ
export type FacilityType =
    | 'gym'            // フィットネスジム
    | 'corporate'      // 企業
    | 'municipality'   // 自治体
    | 'medical';       // 医療機関

// 会員ステータス
export type MemberStatus = 'active' | 'inactive' | 'suspended';

// 測定モード
export type MeasurementMode = 'simple' | 'standard' | 'premium' | 'senior';

// カテゴリスコア
export interface HealthCategoryScores {
    strength: number;        // 筋力
    power: number;           // 瞬発力
    flexibility: number;     // 柔軟性
    balance: number;         // バランス
    agility: number;         // 敏捷性
    endurance: number;       // 持久力
}

// 健康リスク
export interface HealthRisk {
    type: 'metabolic' | 'cardiovascular' | 'musculoskeletal' | 'locomotive';
    level: 'low' | 'medium' | 'high';
    indicators: string[];
    recommendations: string[];
}

// ロコモ度
export type LocomotiveSyndromeRisk = 'none' | 'risk1' | 'risk2';

// フレイル判定
export type FrailtyStatus = 'robust' | 'pre_frail' | 'frail';

// 生活習慣アンケート
export interface LifestyleSurvey {
    exercise: {
        frequency: number;           // 週の運動回数
        duration: number;            // 1回の運動時間（分）
        intensity: string;           // 運動強度
        types: string[];             // 運動種類
    };
    diet: {
        meals_per_day: number;       // 食事回数
        vegetable_intake: string;    // 野菜摂取量
        snack_frequency: string;     // 間食頻度
        eating_speed: string;        // 食事スピード
    };
    sleep: {
        duration: number;            // 睡眠時間
        quality: string;             // 睡眠の質
        wake_feeling: string;        // 起床時の状態
    };
    alcohol: {
        frequency: string;           // 飲酒頻度
        amount: string;              // 飲酒量
    };
    smoking: {
        status: string;              // 'never' | 'former' | 'current'
        amount?: number;             // 1日の本数
    };
    stress: {
        level: string;               // ストレスレベル
        coping_methods: string[];    // ストレス対処法
    };
}
```

---

## 4. 診断ロジック

### 4.0 基礎運動能力分析

人間の基本的な運動パターンを7つのカテゴリに分類し、それぞれを10段階で評価します。

#### 基礎運動カテゴリと評価項目

```typescript
// 基礎運動能力のカテゴリ定義
const fundamentalMovementCategories = {
    walking: {
        name: '歩行能力',
        description: '日常生活の移動基盤となる歩く力',
        measurements: ['walk_10m'],
        dailyActivities: ['買い物', '通勤', '散歩', '家事'],
        riskIfLow: '外出頻度低下、社会参加減少、フレイル進行'
    },
    running: {
        name: '走行能力',
        description: '緊急時や活動時に素早く移動する力',
        measurements: ['run_10m', 'shuttle_run'],
        dailyActivities: ['信号を渡る', '電車に乗り遅れない', 'スポーツ参加'],
        riskIfLow: '緊急時の対応力低下、活動範囲制限'
    },
    climbing: {
        name: '昇降能力',
        description: '段差や階段を安全に移動する力',
        measurements: ['stair_climb', 'tug'],
        dailyActivities: ['階段利用', '段差の乗り越え', '公共交通利用'],
        riskIfLow: '外出困難、住環境制限、転倒リスク増加'
    },
    jumping: {
        name: '跳躍能力',
        description: '瞬間的に体を浮かせる爆発的なパワー',
        measurements: ['standing_jump', 'vertical_jump'],
        dailyActivities: ['水たまりを跳ぶ', '障害物回避', 'スポーツ'],
        riskIfLow: '転倒時の立て直し困難、反射的動作の遅れ'
    },
    throwing: {
        name: '投動作能力',
        description: '上半身と下半身を連動させて物を投げる力',
        measurements: ['ball_throw'],
        dailyActivities: ['ゴミを投げ入れる', '物を渡す', 'スポーツ'],
        riskIfLow: '上半身の協調性低下、肩関節の機能低下'
    },
    gripping: {
        name: '把持能力',
        description: '物をしっかり握り、保持する力',
        measurements: ['grip_right', 'grip_left'],
        dailyActivities: ['ペットボトルを開ける', '買い物袋を持つ', '手すりを掴む'],
        riskIfLow: '日常動作困難、転倒時の受け身不可、サルコペニア指標'
    },
    balancing: {
        name: 'バランス能力',
        description: '姿勢を安定させ、転倒を防ぐ力',
        measurements: ['single_leg_balance_open', 'single_leg_balance_closed', 'functional_reach'],
        dailyActivities: ['靴を履く', '電車で立つ', '不整地を歩く'],
        riskIfLow: '転倒リスク大幅増加、骨折リスク、要介護リスク'
    }
};
```

#### 基礎運動能力の総合分析

```typescript
interface FundamentalMovementAnalysis {
    category: string;
    score: number;                    // 1-10
    grade: 'A' | 'B' | 'C' | 'D' | 'E';
    percentile: number;               // 同年代での百分位
    trend: 'improving' | 'stable' | 'declining';  // 前回比較
    dailyImpact: {
        affectedActivities: string[];   // 影響を受ける日常活動
        riskLevel: 'low' | 'medium' | 'high';
        recommendations: string[];
    };
}

function analyzeFundamentalMovements(
    measurement: HealthMeasurement,
    member: Member
): FundamentalMovementAnalysis[] {
    const analyses: FundamentalMovementAnalysis[] = [];
    const ageGroup = getAgeGroup(member.birthdate);
    const gender = member.gender;

    for (const [key, category] of Object.entries(fundamentalMovementCategories)) {
        // 該当する測定項目のスコアを計算
        const scores = category.measurements
            .filter(m => measurement[m] !== undefined)
            .map(m => calcItemScore(measurement[m], m, ageGroup, gender));

        if (scores.length === 0) continue;

        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const grade = scoreToGrade(avgScore);
        const percentile = scoreToPercentile(avgScore);

        // 日常生活への影響分析
        const dailyImpact = assessDailyImpact(key, avgScore, ageGroup);

        analyses.push({
            category: category.name,
            score: Math.round(avgScore * 10) / 10,
            grade,
            percentile,
            trend: compareToPrevious(member.id, key),
            dailyImpact
        });
    }

    return analyses;
}

// 日常生活への影響評価
function assessDailyImpact(
    categoryKey: string,
    score: number,
    ageGroup: AgeGroup
): FundamentalMovementAnalysis['dailyImpact'] {
    const category = fundamentalMovementCategories[categoryKey];
    const affectedActivities: string[] = [];
    const recommendations: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    if (score < 4) {
        riskLevel = 'high';
        affectedActivities.push(...category.dailyActivities);

        // カテゴリ別の具体的な推奨
        switch (categoryKey) {
            case 'walking':
                recommendations.push(
                    '毎日15分以上の歩行を目標に',
                    '杖やシルバーカーの使用を検討',
                    '転倒予防のため室内の整理'
                );
                break;
            case 'balancing':
                recommendations.push(
                    '片足立ち練習（壁に手をついて）',
                    'タンデム歩行（つぎ足歩行）の練習',
                    '太極拳やヨガへの参加'
                );
                break;
            case 'gripping':
                recommendations.push(
                    'ハンドグリップトレーニング',
                    'タオル絞り運動',
                    '瓶の蓋開け補助器具の使用'
                );
                break;
            // ... 他のカテゴリ
        }
    } else if (score < 6) {
        riskLevel = 'medium';
        affectedActivities.push(...category.dailyActivities.slice(0, 2));
        recommendations.push(`${category.name}を維持・向上させる運動を週2回以上`);
    }

    return { affectedActivities, riskLevel, recommendations };
}
```

#### 基礎運動パターンのレーダーチャート表示

```typescript
// レーダーチャート用データ生成
function generateFundamentalMovementRadarData(
    analyses: FundamentalMovementAnalysis[]
): RadarChartData {
    return {
        labels: analyses.map(a => a.category),
        datasets: [
            {
                label: '今回測定',
                data: analyses.map(a => a.score),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)'
            },
            {
                label: '同年代平均',
                data: analyses.map(() => 5),  // 平均は5
                borderColor: '#F97316',
                backgroundColor: 'transparent',
                borderDash: [5, 5]
            }
        ]
    };
}
```

#### 日常生活動作（ADL）との関連分析

```typescript
// ADL（Activities of Daily Living）への影響評価
interface ADLImpactAssessment {
    adlCategory: string;
    relatedMovements: string[];
    currentCapability: 'independent' | 'needs_support' | 'difficult';
    futureRisk: 'low' | 'medium' | 'high';
    preventionActions: string[];
}

const adlMovementMapping = {
    '歩行・移動': ['walking', 'balancing', 'climbing'],
    '入浴': ['balancing', 'gripping', 'climbing'],
    '着替え': ['balancing', 'gripping'],
    '食事': ['gripping'],
    '排泄': ['walking', 'balancing', 'climbing'],
    '買い物': ['walking', 'gripping', 'climbing'],
    '調理': ['gripping', 'balancing'],
    '掃除・洗濯': ['walking', 'gripping', 'throwing']
};

function assessADLImpact(
    movementAnalyses: FundamentalMovementAnalysis[]
): ADLImpactAssessment[] {
    const assessments: ADLImpactAssessment[] = [];

    for (const [adl, movements] of Object.entries(adlMovementMapping)) {
        const relatedAnalyses = movementAnalyses.filter(
            a => movements.some(m => fundamentalMovementCategories[m]?.name === a.category)
        );

        const avgScore = relatedAnalyses.length > 0
            ? relatedAnalyses.reduce((sum, a) => sum + a.score, 0) / relatedAnalyses.length
            : 5;

        let currentCapability: ADLImpactAssessment['currentCapability'];
        let futureRisk: ADLImpactAssessment['futureRisk'];

        if (avgScore >= 6) {
            currentCapability = 'independent';
            futureRisk = 'low';
        } else if (avgScore >= 4) {
            currentCapability = 'independent';
            futureRisk = 'medium';
        } else {
            currentCapability = 'needs_support';
            futureRisk = 'high';
        }

        assessments.push({
            adlCategory: adl,
            relatedMovements: movements,
            currentCapability,
            futureRisk,
            preventionActions: generatePreventionActions(movements, avgScore)
        });
    }

    return assessments;
}
```

---

### 4.1 年齢・性別別基準値

```typescript
// 年齢区分別の基準値（文部科学省「体力・運動能力調査」ベース）
const healthStandards: Record<AgeGroup, Record<Gender, MeasurementStandards>> = {
    young_adult: {  // 18-39歳
        male: {
            grip: { avg: 47, sd: 7 },
            sit_ups: { avg: 30, sd: 6 },
            standing_jump: { avg: 230, sd: 20 },
            sit_and_reach: { avg: 44, sd: 10 },
            side_step: { avg: 55, sd: 7 },
            shuttle_run: { avg: 75, sd: 20 },
            // ...
        },
        female: {
            grip: { avg: 28, sd: 5 },
            sit_ups: { avg: 20, sd: 5 },
            standing_jump: { avg: 175, sd: 18 },
            sit_and_reach: { avg: 48, sd: 10 },
            side_step: { avg: 47, sd: 6 },
            shuttle_run: { avg: 40, sd: 15 },
            // ...
        }
    },
    middle_age: {  // 40-64歳
        male: {
            grip: { avg: 43, sd: 7 },
            sit_ups: { avg: 22, sd: 6 },
            standing_jump: { avg: 210, sd: 22 },
            // ...
        },
        // ...
    },
    young_senior: {  // 65-74歳
        // ...
    },
    senior: {  // 75歳以上
        // ...
    }
};
```

### 4.2 体力年齢の計算

```typescript
function calcFitnessAge(
    scores: Record<string, number>,
    actualAge: number,
    gender: Gender
): { fitnessAge: number; diff: number } {
    // 各項目のスコアから体力年齢を推定
    // 基準：全項目が同年齢平均 = 実年齢と同じ

    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;

    // スコア50が実年齢相当、10点差で約2歳相当
    const fitnessAge = actualAge - (avgScore - 50) / 5;

    return {
        fitnessAge: Math.round(fitnessAge * 10) / 10,
        diff: Math.round((actualAge - fitnessAge) * 10) / 10  // プラスなら若い
    };
}
```

### 4.3 健康リスク評価

```typescript
function assessHealthRisks(
    measurement: HealthMeasurement,
    member: Member
): HealthRisk[] {
    const risks: HealthRisk[] = [];

    // メタボリックシンドロームリスク
    const metabolicRisk = assessMetabolicRisk(measurement);
    if (metabolicRisk) risks.push(metabolicRisk);

    // 心血管リスク
    const cardiovascularRisk = assessCardiovascularRisk(measurement);
    if (cardiovascularRisk) risks.push(cardiovascularRisk);

    // 運動器リスク
    const musculoskeletalRisk = assessMusculoskeletalRisk(measurement);
    if (musculoskeletalRisk) risks.push(musculoskeletalRisk);

    // ロコモティブシンドロームリスク（高齢者）
    if (getAgeGroup(member.birthdate) === 'senior' || getAgeGroup(member.birthdate) === 'young_senior') {
        const locomotiveRisk = assessLocomotiveRisk(measurement);
        if (locomotiveRisk) risks.push(locomotiveRisk);
    }

    return risks;
}

// メタボリックシンドロームリスク評価
function assessMetabolicRisk(m: HealthMeasurement): HealthRisk | null {
    const indicators: string[] = [];

    // 腹囲（男性85cm以上、女性90cm以上）
    if (m.waist_circumference &&
        ((m.gender === 'male' && m.waist_circumference >= 85) ||
         (m.gender === 'female' && m.waist_circumference >= 90))) {
        indicators.push('腹囲基準超過');
    }

    // BMI 25以上
    if (m.bmi && m.bmi >= 25) {
        indicators.push('BMI 25以上');
    }

    // 高血圧（130/85以上）
    if (m.blood_pressure_systolic >= 130 || m.blood_pressure_diastolic >= 85) {
        indicators.push('血圧高め');
    }

    if (indicators.length === 0) return null;

    return {
        type: 'metabolic',
        level: indicators.length >= 2 ? 'high' : 'medium',
        indicators,
        recommendations: [
            '有酸素運動を週150分以上実施',
            '食事のカロリー管理',
            '野菜を毎食摂取'
        ]
    };
}

// ロコモティブシンドロームリスク評価
function assessLocomotiveRisk(m: HealthMeasurement): HealthRisk | null {
    let riskScore = 0;
    const indicators: string[] = [];

    // 開眼片足立ち15秒未満
    if (m.single_leg_balance_open && m.single_leg_balance_open < 15) {
        riskScore++;
        indicators.push('バランス能力低下');
    }

    // 握力低下（男性28kg未満、女性18kg未満）
    const avgGrip = (m.grip_right + m.grip_left) / 2;
    if ((m.gender === 'male' && avgGrip < 28) ||
        (m.gender === 'female' && avgGrip < 18)) {
        riskScore++;
        indicators.push('握力低下');
    }

    // 2ステップ値（歩幅/身長）
    // ... 追加の評価

    if (riskScore === 0) return null;

    return {
        type: 'locomotive',
        level: riskScore >= 2 ? 'high' : 'medium',
        indicators,
        recommendations: [
            '下肢筋力トレーニング（スクワットなど）',
            'バランストレーニング',
            '毎日の歩行習慣'
        ]
    };
}
```

### 4.4 フレイル判定（高齢者向け）

```typescript
// J-CHS基準（日本版フレイル基準）
function assessFrailty(
    measurement: HealthMeasurement,
    survey: LifestyleSurvey
): FrailtyStatus {
    let frailtyScore = 0;

    // 1. 体重減少（6ヶ月で2-3kg以上の意図しない体重減少）
    // → アンケートで確認

    // 2. 疲労感
    if (survey.sleep.wake_feeling === 'tired') {
        frailtyScore++;
    }

    // 3. 活動量低下
    if (survey.exercise.frequency === 0) {
        frailtyScore++;
    }

    // 4. 握力低下
    const avgGrip = (measurement.grip_right + measurement.grip_left) / 2;
    if ((measurement.gender === 'male' && avgGrip < 28) ||
        (measurement.gender === 'female' && avgGrip < 18)) {
        frailtyScore++;
    }

    // 5. 歩行速度低下（通常歩行で1.0m/秒未満）
    // → 6分間歩行から推定

    if (frailtyScore >= 3) return 'frail';
    if (frailtyScore >= 1) return 'pre_frail';
    return 'robust';
}
```

### 4.5 運動プログラム推奨

```typescript
function recommendPrograms(
    categoryScores: HealthCategoryScores,
    healthRisks: HealthRisk[],
    member: Member
): ExerciseProgram[] {
    const programs: ExerciseProgram[] = [];
    const ageGroup = getAgeGroup(member.birthdate);
    const fitnessLevel = determineFitnessLevel(categoryScores);

    // 弱点カテゴリに対応するプログラムを優先
    const weakCategories = Object.entries(categoryScores)
        .filter(([_, score]) => score < 40)
        .sort((a, b) => a[1] - b[1])
        .map(([category]) => category);

    for (const category of weakCategories.slice(0, 3)) {
        const categoryPrograms = getPrograms({
            category,
            ageGroup,
            fitnessLevel,
            limit: 2
        });
        programs.push(...categoryPrograms);
    }

    // 健康リスクに対応するプログラム
    for (const risk of healthRisks) {
        if (risk.type === 'metabolic') {
            programs.push(...getPrograms({ category: 'cardio', ageGroup, limit: 2 }));
        }
        if (risk.type === 'locomotive') {
            programs.push(...getPrograms({ category: 'balance', ageGroup, limit: 2 }));
            programs.push(...getPrograms({ category: 'strength', target: 'lower_body', limit: 2 }));
        }
    }

    // 重複除去して返す
    return [...new Map(programs.map(p => [p.id, p])).values()];
}
```

---

## 5. 機能一覧

### 5.1 個人向け機能

| 機能 | 説明 |
|------|------|
| **マイページ** | 測定履歴、体力年齢の推移、目標進捗 |
| **結果レポート** | 詳細な診断結果レポート（PDF出力可） |
| **運動プログラム** | パーソナライズされた運動メニュー（動画付き） |
| **運動記録** | 日々の運動をトラッキング |
| **目標設定** | 体重、体脂肪率、体力年齢などの目標管理 |
| **健康アドバイス** | 生活習慣改善のアドバイス |
| **通知・リマインダー** | 測定時期、運動リマインダー |

### 5.2 施設向け機能

| 機能 | 説明 |
|------|------|
| **会員管理** | 会員情報の登録・編集・検索 |
| **測定入力** | 複数人の測定データを効率的に入力 |
| **ダッシュボード** | 会員全体の健康状態を可視化 |
| **リスク管理** | 健康リスクの高い会員を一覧表示 |
| **レポート発行** | 会員向け・管理者向けレポート自動生成 |
| **予約管理** | 測定予約の管理 |
| **CSVエクスポート** | データ出力 |

### 5.3 企業向け機能（健康経営）

| 機能 | 説明 |
|------|------|
| **部署別分析** | 部署ごとの健康状態比較 |
| **経年比較** | 年度ごとの健康指標推移 |
| **健康経営指標** | 健康経営度調査に必要なデータ出力 |
| **匿名集計** | 個人特定されない形での統計レポート |
| **ウェルネスプログラム** | 社内健康イベントの企画サポート |
| **参加率管理** | 健診・運動プログラムの参加率トラッキング |

### 5.4 自治体向け機能

| 機能 | 説明 |
|------|------|
| **地域統計** | 地域住民の健康状態を統計的に分析 |
| **介護予防** | ロコモ・フレイル予防の対象者抽出 |
| **健康教室管理** | 地域の健康教室の参加者管理 |
| **費用対効果分析** | 健康増進事業の効果測定 |
| **国への報告データ** | 保険者機能強化推進交付金の指標データ出力 |

### 5.5 医療機関向け機能

| 機能 | 説明 |
|------|------|
| **患者管理** | 患者の体力測定データ管理 |
| **リハビリ進捗** | リハビリテーションの進捗トラッキング |
| **運動処方** | 医師による運動処方箋の作成サポート |
| **電子カルテ連携** | 電子カルテシステムとのデータ連携 |
| **アウトカム管理** | リハビリ効果の可視化 |

---

## 6. 画面構成

### 6.1 ページ一覧

```
/                                      # ランディングページ
/login                                 # ログイン
/signup                                # 新規登録

# 会員向け
/my                                    # マイページ
/my/profile                            # プロフィール編集
/my/results                            # 測定結果一覧
/my/results/[id]                       # 結果詳細
/my/programs                           # 運動プログラム
/my/programs/[id]                      # プログラム詳細
/my/logs                               # 運動記録
/my/goals                              # 目標管理

# 施設向け
/facility/[slug]                       # 施設トップ
/facility/[slug]/dashboard             # ダッシュボード
/facility/[slug]/members               # 会員一覧
/facility/[slug]/members/[id]          # 会員詳細
/facility/[slug]/members/new           # 会員登録
/facility/[slug]/measure               # 測定入力
/facility/[slug]/measure/[id]          # 測定編集
/facility/[slug]/reports               # レポート
/facility/[slug]/admin                 # 管理画面

# 企業向け
/corporate/[slug]/dashboard            # 企業ダッシュボード
/corporate/[slug]/departments          # 部署別分析
/corporate/[slug]/trends               # 経年推移
/corporate/[slug]/wellness             # ウェルネスプログラム

# 自治体向け
/municipality/[slug]/dashboard         # 自治体ダッシュボード
/municipality/[slug]/statistics        # 地域統計
/municipality/[slug]/prevention        # 介護予防
/municipality/[slug]/programs          # 健康教室管理

# 医療機関向け
/medical/[slug]/patients               # 患者一覧
/medical/[slug]/rehabilitation         # リハビリ管理
/medical/[slug]/prescriptions          # 運動処方

# マスター管理
/admin/login                           # 管理者ログイン
/admin/master                          # マスターダッシュボード
```

### 6.2 レスポンシブ対応

- **PC**: 施設向けダッシュボード、詳細分析
- **タブレット**: 測定入力、会員管理
- **スマートフォン**: 会員向けマイページ、運動記録

---

## 7. 結果表示

### 7.1 個人向けレポート

**ページ1: 総合結果**
- 体力年齢（大きく表示）
- 実年齢との差（+○歳若い / −○歳相当）
- 総合評価（A〜E）
- カテゴリ別レーダーチャート

**ページ2: 詳細分析**
- 各測定項目のスコアと偏差値
- 同年代平均との比較グラフ
- 前回測定との比較（成長度）
- 強み TOP3 / 弱み TOP3

**ページ3: 健康リスク評価**
- メタボリックシンドロームリスク
- ロコモティブシンドロームリスク（該当者のみ）
- フレイルリスク（高齢者のみ）
- 生活習慣の評価

**ページ4: 改善プログラム**
- 推奨運動プログラム（週間スケジュール）
- 生活習慣改善のポイント
- 3ヶ月後の目標値
- 次回測定の推奨時期

### 7.2 施設向けレポート

**概要ページ**
- 会員全体の平均体力年齢
- リスク別会員分布
- 参加率・継続率

**詳細分析**
- 年齢層別の傾向
- 性別分布
- 改善傾向にある会員 / 低下傾向にある会員

### 7.3 企業向けレポート（健康経営）

**エグゼクティブサマリー**
- 全社の健康スコア
- 前年度比較
- 業界ベンチマーク比較

**部署別分析**
- 部署ごとのスコア比較
- 高リスク部署の特定
- 改善提案

---

## 8. ユーザー権限

### 8.1 ロール定義

| ロール | 説明 | 権限 |
|--------|------|------|
| **master** | システム管理者 | 全施設・全データ管理 |
| **partner** | パートナー企業 | 担当施設の管理 |
| **facility_admin** | 施設管理者 | 施設の全機能 |
| **staff** | スタッフ | 測定・閲覧 |
| **member** | 会員 | 自分のデータのみ |
| **hr_admin** | 人事管理者（企業向け） | 部署別統計、匿名データ |
| **municipality_admin** | 自治体担当者 | 地域統計、介護予防 |
| **medical_staff** | 医療スタッフ | 患者データ、運動処方 |

### 8.2 権限マトリクス

| 機能 | master | partner | facility_admin | staff | member | hr_admin |
|------|--------|---------|----------------|-------|--------|----------|
| 施設作成 | ✓ | ✓ | - | - | - | - |
| 会員登録 | ✓ | ✓ | ✓ | ✓ | - | - |
| 測定入力 | ✓ | ✓ | ✓ | ✓ | - | - |
| 全員閲覧 | ✓ | ✓ | ✓ | ✓ | - | - |
| 自分閲覧 | - | - | - | - | ✓ | - |
| 匿名統計 | ✓ | ✓ | ✓ | - | - | ✓ |
| アカウント管理 | ✓ | ✓ | ✓ | - | - | - |

---

## 9. 技術仕様

### 9.1 フロントエンド
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Recharts（グラフ）
- PWA対応（会員向けモバイル）

### 9.2 バックエンド
- Supabase (PostgreSQL + Auth + Storage)
- Next.js API Routes
- Edge Functions（レポート生成、通知）

### 9.3 外部連携
- Google Fit / Apple HealthKit（運動データ連携）
- Fitbit / Garmin API（ウェアラブル連携）
- 電子カルテ連携（FHIR対応）
- LINE通知
- Slack連携（企業向け）

---

## 10. 料金プラン（想定）

### 10.1 フィットネス施設向け

| プラン | 月額 | 会員数上限 | 機能 |
|--------|------|----------|------|
| **ライト** | ¥9,800 | 100名 | 基本測定・レポート |
| **スタンダード** | ¥29,800 | 500名 | 全機能 |
| **プロ** | ¥59,800 | 2,000名 | 全機能 + API連携 |
| **エンタープライズ** | 要相談 | 無制限 | カスタム開発対応 |

### 10.2 企業向け（健康経営）

| プラン | 従業員数 | 月額 | 機能 |
|--------|---------|------|------|
| **スモール** | 〜100名 | ¥50,000 | 基本測定・部署別分析 |
| **ミディアム** | 〜500名 | ¥150,000 | 全機能 |
| **ラージ** | 〜2,000名 | ¥300,000 | 全機能 + 専任サポート |
| **エンタープライズ** | 2,000名〜 | 要相談 | カスタム対応 |

### 10.3 自治体向け

| プラン | 住民数 | 年額 | 機能 |
|--------|--------|------|------|
| **基本** | 〜5万人 | ¥1,200,000 | 基本測定・地域統計 |
| **拡張** | 〜20万人 | ¥3,000,000 | 全機能 |
| **広域** | 20万人〜 | 要相談 | 複数自治体対応 |

---

## 11. 今後の展開

### Phase 1（初期リリース）
- 基本測定・診断機能
- 会員管理
- 施設ダッシュボード
- 個人向けマイページ

### Phase 2
- ウェアラブルデバイス連携
- 運動記録トラッキング
- AI による健康アドバイス
- 企業向け機能強化

### Phase 3
- 電子カルテ連携
- 医療機関向け機能
- 自治体向け介護予防機能
- 多言語対応

### Phase 4
- 予測分析（将来の健康リスク予測）
- パーソナルAIトレーナー
- VR/AR 運動プログラム
- 遠隔健康相談

---

## 付録A: NOBISHIROシリーズ間の連携

### データ継続性
- KIDS → ATHLETE → HEALTH とライフステージに応じてデータを引き継ぎ
- 生涯にわたる体力推移をトラッキング

### ファミリーアカウント
- 家族全員のデータを一元管理
- 親子で KIDS と HEALTH を併用可能

### 共通ロジック
- 偏差値計算、スコア変換ロジックは共通
- 年齢に応じた基準値テーブルを切り替え

---

## 付録B: 参考文献・基準

### 体力測定基準
- 文部科学省「体力・運動能力調査」
- 厚生労働省「健康づくりのための身体活動基準2013」

### 健康リスク評価
- 日本肥満学会「メタボリックシンドロームの診断基準」
- 日本整形外科学会「ロコモティブシンドロームの判定基準」
- 日本老年医学会「フレイルの診断基準」

### 運動処方
- ACSM's Guidelines for Exercise Testing and Prescription
- 日本体育協会「公認スポーツ指導者養成テキスト」

---

*NOBISHIRO HEALTH 仕様書 v1.0*
*作成日: 2025年12月17日*
