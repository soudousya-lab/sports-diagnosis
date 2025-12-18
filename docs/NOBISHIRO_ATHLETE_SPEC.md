# NOBISHIRO ATHLETE 仕様書

## 中高生スポーツ団体向け運動能力診断システム

---

## 1. システム概要

### 1.1 コンセプト

**NOBISHIRO ATHLETE**は、中学生・高校生のスポーツ選手向けに設計された運動能力診断システムです。部活動・クラブチーム・ジュニアユースなどのスポーツ団体が選手の能力を科学的に測定・分析し、パフォーマンス向上とケガ予防をサポートします。

### 1.2 ターゲットユーザー

| ユーザー種別 | 説明 |
|------------|------|
| **スポーツ団体** | 中学・高校の部活動、クラブチーム、ジュニアユース、スポーツアカデミー |
| **指導者** | 監督、コーチ、トレーナー |
| **選手** | 中学1年〜高校3年（12〜18歳） |
| **保護者** | 選手の保護者 |

### 1.3 NOBISHIRO KIDSとの違い

| 項目 | KIDS（小学生向け） | ATHLETE（中高生向け） |
|------|-------------------|---------------------|
| 対象年齢 | 年長〜小6（5〜12歳） | 中1〜高3（12〜18歳） |
| 測定項目 | 7項目 | 12項目（拡張） |
| 評価軸 | 運動能力全般 | 競技特性・フィジカル・メンタル |
| 目的 | スポーツ適性発見 | パフォーマンス向上・ケガ予防 |
| 出力形式 | 親向けレポート | 選手・指導者向け詳細分析 |

---

## 2. 測定項目

### 2.1 基本測定項目（12項目）

#### フィジカル基礎（6項目）

| No | 項目 | 計測内容 | 単位 | 評価対象 |
|----|------|---------|------|---------|
| 1 | **握力** | 左右の握力の平均 | kg | 筋力 |
| 2 | **立ち幅跳び** | 両足踏切での跳躍距離 | cm | 瞬発力（下半身） |
| 3 | **50m走** | 50mのタイム | 秒 | スピード |
| 4 | **反復横跳び** | 20秒間の回数 | 回 | 敏捷性 |
| 5 | **持久走/シャトルラン** | 1500m走 or 20mシャトルラン | 分秒/回 | 持久力 |
| 6 | **ハンドボール投げ** | ハンドボールの投擲距離 | m | 投力・上半身パワー |

#### フィジカル拡張（4項目）

| No | 項目 | 計測内容 | 単位 | 評価対象 |
|----|------|---------|------|---------|
| 7 | **垂直跳び** | 最高到達点 - 立位到達点 | cm | 瞬発力（ジャンプ力） |
| 8 | **長座体前屈** | 座位での前屈距離 | cm | 柔軟性 |
| 9 | **上体起こし** | 30秒間の回数 | 回 | 体幹・腹筋持久力 |
| 10 | **プロアジリティ** | 5-10-5ヤードシャトル | 秒 | 方向転換能力 |

#### 競技特性（2項目）

| No | 項目 | 計測内容 | 単位 | 評価対象 |
|----|------|---------|------|---------|
| 11 | **10m加速** | スタートから10mまでの加速タイム | 秒 | 初動加速力 |
| 12 | **Tテスト** | T字パターンでのアジリティ | 秒 | 総合アジリティ |

### 2.2 オプション測定項目

競技特性に応じて追加可能な測定項目：

| 競技カテゴリ | 追加測定項目 |
|------------|-------------|
| 球技全般 | リアクションタイム、キック力測定 |
| 格闘技 | 背筋力、握力持続時間 |
| 陸上競技 | 100m走、スタートリアクション |
| 水泳 | 肺活量、浮力測定 |
| 体操・ダンス | Y字バランス保持時間、開脚角度 |

### 2.3 測定モード

| モード | 測定項目数 | 所要時間 | 用途 |
|--------|----------|---------|------|
| **クイック診断** | 6項目（基礎のみ） | 約30分 | 定期チェック、入部時スクリーニング |
| **スタンダード診断** | 10項目 | 約60分 | 月次・シーズン前評価 |
| **フル診断** | 12項目+オプション | 約90分 | 詳細分析、ケガ後復帰判定 |

---

## 3. データ構造（スキーマ設計）

### 3.1 データベーステーブル

```sql
-- 団体（チーム）情報
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,                    -- チーム名
    slug VARCHAR(100) UNIQUE NOT NULL,             -- URL用スラッグ
    organization_type VARCHAR(50),                 -- 'junior_high_club', 'high_school_club', 'club_team', 'academy'
    sport_type VARCHAR(50),                        -- 主要スポーツ種目
    logo_url TEXT,
    prefecture VARCHAR(50),                        -- 都道府県
    city VARCHAR(100),                             -- 市区町村
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    theme_color VARCHAR(7) DEFAULT '#003366',
    partner_id UUID REFERENCES partners(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 選手情報
CREATE TABLE athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id),
    name VARCHAR(100) NOT NULL,
    furigana VARCHAR(100),
    birthdate DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    school_year VARCHAR(10),                       -- 'j1', 'j2', 'j3', 'h1', 'h2', 'h3'
    position VARCHAR(100),                         -- ポジション（競技による）
    jersey_number VARCHAR(10),                     -- 背番号
    height DECIMAL(5,1),                           -- cm
    weight DECIMAL(5,1),                           -- kg
    dominant_hand VARCHAR(10),                     -- 'right', 'left', 'both'
    dominant_foot VARCHAR(10),                     -- 'right', 'left', 'both'
    injury_history JSONB,                          -- 過去のケガ歴
    medical_notes TEXT,                            -- 医療上の注意事項
    status VARCHAR(20) DEFAULT 'active',           -- 'active', 'injured', 'inactive'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 測定記録
CREATE TABLE athlete_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES athletes(id),
    team_id UUID NOT NULL REFERENCES teams(id),
    measured_at DATE NOT NULL,
    mode VARCHAR(20) DEFAULT 'standard',           -- 'quick', 'standard', 'full'
    season VARCHAR(20),                            -- 'pre_season', 'in_season', 'post_season', 'off_season'

    -- フィジカル基礎
    grip_right DECIMAL(5,1),                       -- kg
    grip_left DECIMAL(5,1),                        -- kg
    standing_jump INTEGER,                         -- cm
    sprint_50m DECIMAL(5,2),                       -- 秒
    side_step INTEGER,                             -- 回（20秒）
    endurance_run DECIMAL(6,2),                    -- 分秒形式 or シャトルラン回数
    endurance_type VARCHAR(20),                    -- 'run_1500m', 'shuttle_run'
    handball_throw DECIMAL(5,1),                   -- m

    -- フィジカル拡張
    vertical_jump INTEGER,                         -- cm
    sit_and_reach INTEGER,                         -- cm（マイナスあり）
    sit_ups INTEGER,                               -- 回（30秒）
    pro_agility DECIMAL(5,2),                      -- 秒

    -- 競技特性
    sprint_10m DECIMAL(5,2),                       -- 秒
    t_test DECIMAL(5,2),                           -- 秒

    -- オプション（JSONB）
    optional_measurements JSONB,

    -- メタ情報
    measured_by VARCHAR(100),                      -- 測定者
    notes TEXT,                                    -- メモ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 診断結果
CREATE TABLE athlete_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    measurement_id UUID NOT NULL REFERENCES athlete_measurements(id),

    -- 総合評価
    overall_score DECIMAL(4,1),                    -- 100点満点
    physical_age DECIMAL(4,1),                     -- フィジカル年齢
    physical_age_diff DECIMAL(4,1),                -- 実年齢との差

    -- カテゴリ別スコア（JSONB）
    category_scores JSONB,                         -- {strength: 75, speed: 82, agility: 68, ...}

    -- 各項目スコア（JSONB）
    item_scores JSONB,                             -- {grip: 8, standing_jump: 7, ...}

    -- 競技適性
    sport_aptitudes JSONB,                         -- [{sport: "サッカー", aptitude: 85, ...}, ...]

    -- 強み・弱み分析
    strengths JSONB,                               -- [{item: "sprint_50m", score: 9, ...}, ...]
    weaknesses JSONB,                              -- [{item: "flexibility", score: 4, ...}, ...]

    -- ポジション適性（競技ごと）
    position_aptitudes JSONB,                      -- [{position: "FW", aptitude: 82}, ...]

    -- トレーニング推奨
    recommended_trainings JSONB,

    -- ケガリスク評価
    injury_risk_assessment JSONB,                  -- {overall: 'low', details: [...]}

    -- コンディション評価
    condition_evaluation JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- トレーニングメニュー
CREATE TABLE athlete_trainings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ability_key VARCHAR(50) NOT NULL,              -- 対象能力
    age_group VARCHAR(20) NOT NULL,                -- 'junior_high', 'high_school'
    sport_type VARCHAR(50),                        -- 競技別（NULL=全競技共通）
    level VARCHAR(20),                             -- 'beginner', 'intermediate', 'advanced'
    name VARCHAR(200) NOT NULL,
    description TEXT,
    reps VARCHAR(100),                             -- 回数・セット
    sets INTEGER,
    rest_time VARCHAR(50),                         -- 休息時間
    video_url TEXT,                                -- 動画URL
    image_url TEXT,
    effect TEXT,
    caution TEXT,                                  -- 注意点
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- シーズン目標
CREATE TABLE athlete_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES athletes(id),
    season VARCHAR(50),                            -- '2025_spring', '2025_summer' など
    goal_type VARCHAR(50),                         -- 'short_term', 'season', 'long_term'
    target_metrics JSONB,                          -- {sprint_50m: 6.8, vertical_jump: 55, ...}
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 型定義（TypeScript）

```typescript
// 学年
export type SchoolYear = 'j1' | 'j2' | 'j3' | 'h1' | 'h2' | 'h3';

// 学年と実年齢のマッピング
export const schoolYearToAge: Record<SchoolYear, number> = {
    j1: 13, j2: 14, j3: 15,  // 中学生
    h1: 16, h2: 17, h3: 18   // 高校生
};

// 団体種別
export type OrganizationType =
    | 'junior_high_club'    // 中学部活
    | 'high_school_club'    // 高校部活
    | 'club_team'           // クラブチーム
    | 'academy';            // アカデミー

// 選手ステータス
export type AthleteStatus = 'active' | 'injured' | 'inactive';

// 測定モード
export type MeasurementMode = 'quick' | 'standard' | 'full';

// シーズン
export type Season = 'pre_season' | 'in_season' | 'post_season' | 'off_season';

// カテゴリスコア
export interface CategoryScores {
    strength: number;      // 筋力
    power: number;         // パワー
    speed: number;         // スピード
    agility: number;       // 敏捷性
    endurance: number;     // 持久力
    flexibility: number;   // 柔軟性
    core: number;          // 体幹
}

// ケガリスク評価
export interface InjuryRiskAssessment {
    overall: 'low' | 'medium' | 'high';
    risks: {
        area: string;           // 部位
        risk_level: string;     // リスクレベル
        reason: string;         // 理由
        prevention: string;     // 予防策
    }[];
}
```

---

## 4. 診断ロジック

### 4.1 スコア計算

#### 偏差値計算（10段階評価）

```typescript
// 学年・性別別の平均値と標準偏差データを使用
const athleteAverageData: Record<SchoolYear, Record<Gender, MeasurementAverages>> = {
    j1: {
        male: { grip: 28, standing_jump: 195, sprint_50m: 8.2, ... },
        female: { grip: 22, standing_jump: 170, sprint_50m: 9.0, ... }
    },
    // ... 各学年のデータ
};

// 偏差値計算
function calcDeviation(value: number, avg: number, sd: number, reverse = false): number {
    if (reverse) {
        return 50 + 10 * (avg - value) / sd;
    }
    return 50 + 10 * (value - avg) / sd;
}

// 100点満点への変換
function deviationTo100(deviation: number): number {
    // 偏差値30〜70を0〜100にマッピング
    return Math.max(0, Math.min(100, (deviation - 30) * 2.5));
}
```

### 4.2 カテゴリ別評価

```typescript
// カテゴリと測定項目のマッピング
const categoryMapping: Record<string, string[]> = {
    strength: ['grip'],
    power: ['standing_jump', 'vertical_jump', 'handball_throw'],
    speed: ['sprint_50m', 'sprint_10m'],
    agility: ['side_step', 'pro_agility', 't_test'],
    endurance: ['endurance_run', 'sit_ups'],
    flexibility: ['sit_and_reach'],
    core: ['sit_ups', 'vertical_jump']
};

// カテゴリスコア計算
function calcCategoryScores(itemScores: Record<string, number>): CategoryScores {
    const result: Partial<CategoryScores> = {};

    for (const [category, items] of Object.entries(categoryMapping)) {
        const scores = items
            .filter(item => itemScores[item] !== undefined)
            .map(item => itemScores[item]);

        if (scores.length > 0) {
            result[category as keyof CategoryScores] =
                Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        }
    }

    return result as CategoryScores;
}
```

### 4.3 フィジカル年齢の計算

```typescript
function calcPhysicalAge(
    overallScore: number,
    actualAge: number
): { physicalAge: number; diff: number } {
    // 基準：平均スコア50点 = 実年齢相当
    // 10点差ごとに約1歳相当の差
    const physicalAge = actualAge + (overallScore - 50) / 10;

    return {
        physicalAge: Math.round(physicalAge * 10) / 10,
        diff: Math.round((physicalAge - actualAge) * 10) / 10
    };
}
```

### 4.4 競技適性計算

```typescript
// 競技別の必要能力ウェイト（50競技対応）
const sportRequirements: Record<string, SportRequirement> = {

    // ═══════════════════════════════════════════════════════════════
    // 【球技 - チームスポーツ】
    // ═══════════════════════════════════════════════════════════════

    soccer: {
        name: 'サッカー',
        category: 'ball_team',
        weights: { speed: 0.25, agility: 0.25, endurance: 0.20, power: 0.15, strength: 0.15 },
        positions: ['GK', 'CB', 'SB', 'DMF', 'CMF', 'OMF', 'WG', 'FW']
    },
    futsal: {
        name: 'フットサル',
        category: 'ball_team',
        weights: { agility: 0.30, speed: 0.25, endurance: 0.20, power: 0.15, core: 0.10 }
    },
    basketball: {
        name: 'バスケットボール',
        category: 'ball_team',
        weights: { power: 0.25, agility: 0.25, speed: 0.20, endurance: 0.15, strength: 0.15 },
        positions: ['PG', 'SG', 'SF', 'PF', 'C']
    },
    volleyball: {
        name: 'バレーボール',
        category: 'ball_team',
        weights: { power: 0.35, agility: 0.25, speed: 0.15, strength: 0.15, flexibility: 0.10 },
        positions: ['S', 'OH', 'MB', 'OP', 'L']
    },
    handball: {
        name: 'ハンドボール',
        category: 'ball_team',
        weights: { power: 0.25, speed: 0.25, strength: 0.20, agility: 0.15, endurance: 0.15 },
        positions: ['GK', 'LW', 'RW', 'LB', 'RB', 'CB', 'P']
    },
    rugby: {
        name: 'ラグビー',
        category: 'ball_team',
        weights: { strength: 0.25, power: 0.25, speed: 0.20, endurance: 0.15, agility: 0.15 },
        positions: ['PR', 'HO', 'LO', 'FL', 'NO8', 'SH', 'SO', 'CTB', 'WG', 'FB']
    },
    american_football: {
        name: 'アメリカンフットボール',
        category: 'ball_team',
        weights: { power: 0.25, speed: 0.25, strength: 0.20, agility: 0.20, core: 0.10 },
        positions: ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K']
    },
    lacrosse: {
        name: 'ラクロス',
        category: 'ball_team',
        weights: { agility: 0.25, speed: 0.25, endurance: 0.20, power: 0.15, strength: 0.15 }
    },
    field_hockey: {
        name: 'フィールドホッケー',
        category: 'ball_team',
        weights: { agility: 0.25, endurance: 0.25, speed: 0.20, power: 0.15, flexibility: 0.15 }
    },
    ice_hockey: {
        name: 'アイスホッケー',
        category: 'ball_team',
        weights: { agility: 0.25, speed: 0.25, power: 0.20, strength: 0.15, endurance: 0.15 },
        positions: ['GK', 'D', 'LW', 'RW', 'C']
    },
    water_polo: {
        name: '水球',
        category: 'ball_team',
        weights: { endurance: 0.30, strength: 0.25, power: 0.20, agility: 0.15, flexibility: 0.10 }
    },

    // ═══════════════════════════════════════════════════════════════
    // 【球技 - ラケット/バット】
    // ═══════════════════════════════════════════════════════════════

    baseball: {
        name: '野球',
        category: 'ball_bat',
        weights: { power: 0.30, speed: 0.20, agility: 0.20, strength: 0.20, flexibility: 0.10 },
        positions: ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF']
    },
    softball: {
        name: 'ソフトボール',
        category: 'ball_bat',
        weights: { power: 0.25, agility: 0.25, speed: 0.20, strength: 0.20, flexibility: 0.10 },
        positions: ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF']
    },
    tennis: {
        name: 'テニス',
        category: 'racket',
        weights: { agility: 0.30, speed: 0.25, power: 0.20, endurance: 0.15, flexibility: 0.10 }
    },
    soft_tennis: {
        name: 'ソフトテニス',
        category: 'racket',
        weights: { agility: 0.30, speed: 0.25, endurance: 0.20, power: 0.15, flexibility: 0.10 }
    },
    badminton: {
        name: 'バドミントン',
        category: 'racket',
        weights: { agility: 0.35, speed: 0.25, power: 0.15, endurance: 0.15, flexibility: 0.10 }
    },
    table_tennis: {
        name: '卓球',
        category: 'racket',
        weights: { agility: 0.35, speed: 0.25, core: 0.20, power: 0.10, flexibility: 0.10 }
    },
    squash: {
        name: 'スカッシュ',
        category: 'racket',
        weights: { agility: 0.30, endurance: 0.25, speed: 0.20, power: 0.15, flexibility: 0.10 }
    },

    // ═══════════════════════════════════════════════════════════════
    // 【陸上競技】
    // ═══════════════════════════════════════════════════════════════

    track_sprint: {
        name: '陸上短距離（100m/200m）',
        category: 'track',
        weights: { speed: 0.40, power: 0.30, agility: 0.15, flexibility: 0.15 }
    },
    track_400m: {
        name: '陸上400m',
        category: 'track',
        weights: { speed: 0.30, endurance: 0.30, power: 0.20, core: 0.10, flexibility: 0.10 }
    },
    track_middle: {
        name: '陸上中距離（800m/1500m）',
        category: 'track',
        weights: { endurance: 0.40, speed: 0.25, core: 0.15, flexibility: 0.10, power: 0.10 }
    },
    track_distance: {
        name: '陸上長距離（3000m/5000m）',
        category: 'track',
        weights: { endurance: 0.50, speed: 0.20, core: 0.15, flexibility: 0.15 }
    },
    track_marathon: {
        name: 'マラソン/駅伝',
        category: 'track',
        weights: { endurance: 0.55, core: 0.20, flexibility: 0.15, speed: 0.10 }
    },
    track_hurdles: {
        name: 'ハードル',
        category: 'track',
        weights: { speed: 0.30, agility: 0.25, flexibility: 0.25, power: 0.20 }
    },
    track_high_jump: {
        name: '走高跳',
        category: 'field',
        weights: { power: 0.35, flexibility: 0.25, speed: 0.20, agility: 0.20 }
    },
    track_long_jump: {
        name: '走幅跳',
        category: 'field',
        weights: { power: 0.35, speed: 0.30, agility: 0.20, flexibility: 0.15 }
    },
    track_triple_jump: {
        name: '三段跳',
        category: 'field',
        weights: { power: 0.35, speed: 0.25, agility: 0.20, core: 0.10, flexibility: 0.10 }
    },
    track_pole_vault: {
        name: '棒高跳',
        category: 'field',
        weights: { power: 0.30, speed: 0.25, flexibility: 0.20, strength: 0.15, core: 0.10 }
    },
    track_shot_put: {
        name: '砲丸投',
        category: 'field',
        weights: { strength: 0.35, power: 0.35, core: 0.15, speed: 0.15 }
    },
    track_discus: {
        name: '円盤投',
        category: 'field',
        weights: { power: 0.30, strength: 0.30, agility: 0.20, core: 0.10, flexibility: 0.10 }
    },
    track_javelin: {
        name: 'やり投',
        category: 'field',
        weights: { power: 0.35, speed: 0.25, flexibility: 0.20, strength: 0.10, core: 0.10 }
    },
    track_hammer: {
        name: 'ハンマー投',
        category: 'field',
        weights: { strength: 0.35, power: 0.30, agility: 0.20, core: 0.15 }
    },
    decathlon: {
        name: '十種競技',
        category: 'field',
        weights: { power: 0.25, speed: 0.20, endurance: 0.20, strength: 0.15, flexibility: 0.10, agility: 0.10 }
    },

    // ═══════════════════════════════════════════════════════════════
    // 【水泳】
    // ═══════════════════════════════════════════════════════════════

    swimming_sprint: {
        name: '競泳短距離（50m/100m）',
        category: 'swimming',
        weights: { power: 0.35, speed: 0.25, strength: 0.20, flexibility: 0.20 }
    },
    swimming_middle: {
        name: '競泳中距離（200m/400m）',
        category: 'swimming',
        weights: { endurance: 0.30, power: 0.25, flexibility: 0.25, strength: 0.20 }
    },
    swimming_distance: {
        name: '競泳長距離（800m/1500m）',
        category: 'swimming',
        weights: { endurance: 0.45, flexibility: 0.25, power: 0.15, strength: 0.15 }
    },
    swimming_medley: {
        name: '個人メドレー',
        category: 'swimming',
        weights: { endurance: 0.30, flexibility: 0.25, power: 0.20, agility: 0.15, strength: 0.10 }
    },
    diving: {
        name: '飛込',
        category: 'swimming',
        weights: { power: 0.30, flexibility: 0.30, agility: 0.20, core: 0.20 }
    },
    artistic_swimming: {
        name: 'アーティスティックスイミング',
        category: 'swimming',
        weights: { flexibility: 0.30, endurance: 0.25, power: 0.20, core: 0.15, agility: 0.10 }
    },

    // ═══════════════════════════════════════════════════════════════
    // 【武道・格闘技】
    // ═══════════════════════════════════════════════════════════════

    judo: {
        name: '柔道',
        category: 'martial_arts',
        weights: { strength: 0.30, power: 0.25, agility: 0.20, core: 0.15, flexibility: 0.10 }
    },
    kendo: {
        name: '剣道',
        category: 'martial_arts',
        weights: { agility: 0.30, speed: 0.25, power: 0.20, endurance: 0.15, core: 0.10 }
    },
    karate: {
        name: '空手',
        category: 'martial_arts',
        weights: { agility: 0.25, speed: 0.25, power: 0.20, flexibility: 0.15, core: 0.15 }
    },
    wrestling: {
        name: 'レスリング',
        category: 'martial_arts',
        weights: { strength: 0.30, power: 0.25, endurance: 0.20, agility: 0.15, flexibility: 0.10 }
    },
    boxing: {
        name: 'ボクシング',
        category: 'martial_arts',
        weights: { agility: 0.25, speed: 0.25, endurance: 0.20, power: 0.15, core: 0.15 }
    },
    taekwondo: {
        name: 'テコンドー',
        category: 'martial_arts',
        weights: { agility: 0.25, flexibility: 0.25, speed: 0.20, power: 0.20, core: 0.10 }
    },
    aikido: {
        name: '合気道',
        category: 'martial_arts',
        weights: { flexibility: 0.30, core: 0.25, agility: 0.20, strength: 0.15, power: 0.10 }
    },
    sumo: {
        name: '相撲',
        category: 'martial_arts',
        weights: { strength: 0.35, power: 0.30, core: 0.20, agility: 0.15 }
    },
    fencing: {
        name: 'フェンシング',
        category: 'martial_arts',
        weights: { agility: 0.35, speed: 0.25, endurance: 0.15, power: 0.15, flexibility: 0.10 }
    },

    // ═══════════════════════════════════════════════════════════════
    // 【体操・ダンス】
    // ═══════════════════════════════════════════════════════════════

    gymnastics_artistic: {
        name: '体操競技',
        category: 'gymnastics',
        weights: { power: 0.25, flexibility: 0.25, core: 0.25, strength: 0.15, agility: 0.10 }
    },
    gymnastics_rhythmic: {
        name: '新体操',
        category: 'gymnastics',
        weights: { flexibility: 0.35, core: 0.25, agility: 0.20, power: 0.10, endurance: 0.10 }
    },
    trampoline: {
        name: 'トランポリン',
        category: 'gymnastics',
        weights: { power: 0.30, core: 0.30, agility: 0.20, flexibility: 0.20 }
    },
    cheerleading: {
        name: 'チアリーディング',
        category: 'dance',
        weights: { power: 0.25, flexibility: 0.25, core: 0.20, agility: 0.15, endurance: 0.15 }
    },
    dance_competitive: {
        name: 'ダンス（競技）',
        category: 'dance',
        weights: { flexibility: 0.25, agility: 0.25, endurance: 0.20, power: 0.15, core: 0.15 }
    },

    // ═══════════════════════════════════════════════════════════════
    // 【ウィンタースポーツ】
    // ═══════════════════════════════════════════════════════════════

    ski_alpine: {
        name: 'アルペンスキー',
        category: 'winter',
        weights: { power: 0.30, agility: 0.25, core: 0.20, endurance: 0.15, flexibility: 0.10 }
    },
    ski_cross_country: {
        name: 'クロスカントリースキー',
        category: 'winter',
        weights: { endurance: 0.45, power: 0.20, strength: 0.15, core: 0.10, flexibility: 0.10 }
    },
    ski_jump: {
        name: 'スキージャンプ',
        category: 'winter',
        weights: { power: 0.35, core: 0.25, flexibility: 0.20, agility: 0.20 }
    },
    snowboard: {
        name: 'スノーボード',
        category: 'winter',
        weights: { agility: 0.30, power: 0.25, core: 0.25, flexibility: 0.20 }
    },
    figure_skating: {
        name: 'フィギュアスケート',
        category: 'winter',
        weights: { flexibility: 0.30, power: 0.25, agility: 0.20, core: 0.15, endurance: 0.10 }
    },
    speed_skating: {
        name: 'スピードスケート',
        category: 'winter',
        weights: { power: 0.35, endurance: 0.25, speed: 0.20, core: 0.10, flexibility: 0.10 }
    },
    curling: {
        name: 'カーリング',
        category: 'winter',
        weights: { core: 0.30, flexibility: 0.25, endurance: 0.20, agility: 0.15, strength: 0.10 }
    },

    // ═══════════════════════════════════════════════════════════════
    // 【その他】
    // ═══════════════════════════════════════════════════════════════

    golf: {
        name: 'ゴルフ',
        category: 'other',
        weights: { power: 0.30, flexibility: 0.25, core: 0.25, agility: 0.10, endurance: 0.10 }
    },
    archery: {
        name: 'アーチェリー',
        category: 'other',
        weights: { core: 0.35, strength: 0.25, endurance: 0.20, flexibility: 0.10, agility: 0.10 }
    },
    kyudo: {
        name: '弓道',
        category: 'other',
        weights: { core: 0.35, strength: 0.25, flexibility: 0.20, endurance: 0.20 }
    },
    rowing: {
        name: 'ボート（漕艇）',
        category: 'other',
        weights: { endurance: 0.35, power: 0.25, strength: 0.20, core: 0.10, flexibility: 0.10 }
    },
    canoe_kayak: {
        name: 'カヌー/カヤック',
        category: 'other',
        weights: { power: 0.30, endurance: 0.25, strength: 0.20, core: 0.15, agility: 0.10 }
    },
    cycling_road: {
        name: '自転車（ロード）',
        category: 'other',
        weights: { endurance: 0.45, power: 0.25, core: 0.15, flexibility: 0.15 }
    },
    cycling_track: {
        name: '自転車（トラック）',
        category: 'other',
        weights: { power: 0.35, speed: 0.25, endurance: 0.20, core: 0.10, flexibility: 0.10 }
    },
    triathlon: {
        name: 'トライアスロン',
        category: 'other',
        weights: { endurance: 0.40, power: 0.20, flexibility: 0.15, speed: 0.15, core: 0.10 }
    },
    climbing: {
        name: 'クライミング',
        category: 'other',
        weights: { strength: 0.30, power: 0.25, flexibility: 0.20, core: 0.15, agility: 0.10 }
    },
    skateboard: {
        name: 'スケートボード',
        category: 'other',
        weights: { agility: 0.30, core: 0.25, power: 0.20, flexibility: 0.15, speed: 0.10 }
    }
};

// 適性スコア計算
function calcSportAptitude(
    categoryScores: CategoryScores,
    sport: string
): number {
    const requirements = sportRequirements[sport];
    if (!requirements) return 0;

    let weightedSum = 0;
    let totalWeight = 0;

    for (const [category, weight] of Object.entries(requirements)) {
        if (categoryScores[category as keyof CategoryScores] !== undefined) {
            weightedSum += categoryScores[category as keyof CategoryScores] * weight;
            totalWeight += weight;
        }
    }

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}
```

### 4.5 ポジション適性（主要競技）

```typescript
// ═══════════════════════════════════════════════════════════════
// 【サッカー】
// ═══════════════════════════════════════════════════════════════
const soccerPositionRequirements: Record<string, PositionRequirement> = {
    GK: { name: 'ゴールキーパー', weights: { agility: 0.3, power: 0.3, flexibility: 0.2, speed: 0.2 } },
    CB: { name: 'センターバック', weights: { strength: 0.3, power: 0.25, speed: 0.25, agility: 0.2 } },
    SB: { name: 'サイドバック', weights: { speed: 0.3, endurance: 0.25, agility: 0.25, power: 0.2 } },
    DMF: { name: 'ボランチ', weights: { endurance: 0.3, agility: 0.25, strength: 0.25, speed: 0.2 } },
    CMF: { name: 'セントラルMF', weights: { endurance: 0.3, agility: 0.3, speed: 0.2, power: 0.2 } },
    OMF: { name: 'トップ下', weights: { agility: 0.3, speed: 0.3, power: 0.2, endurance: 0.2 } },
    WG: { name: 'ウイング', weights: { speed: 0.35, agility: 0.3, power: 0.2, endurance: 0.15 } },
    FW: { name: 'フォワード', weights: { speed: 0.3, power: 0.3, agility: 0.25, strength: 0.15 } }
};

// ═══════════════════════════════════════════════════════════════
// 【バスケットボール】
// ═══════════════════════════════════════════════════════════════
const basketballPositionRequirements: Record<string, PositionRequirement> = {
    PG: { name: 'ポイントガード', weights: { agility: 0.35, speed: 0.30, endurance: 0.20, power: 0.15 } },
    SG: { name: 'シューティングガード', weights: { speed: 0.30, agility: 0.25, power: 0.25, endurance: 0.20 } },
    SF: { name: 'スモールフォワード', weights: { speed: 0.25, power: 0.25, agility: 0.25, strength: 0.15, endurance: 0.10 } },
    PF: { name: 'パワーフォワード', weights: { power: 0.30, strength: 0.30, agility: 0.20, speed: 0.20 } },
    C: { name: 'センター', weights: { strength: 0.35, power: 0.30, core: 0.20, agility: 0.15 } }
};

// ═══════════════════════════════════════════════════════════════
// 【バレーボール】
// ═══════════════════════════════════════════════════════════════
const volleyballPositionRequirements: Record<string, PositionRequirement> = {
    S: { name: 'セッター', weights: { agility: 0.35, power: 0.25, speed: 0.20, core: 0.20 } },
    OH: { name: 'アウトサイドヒッター', weights: { power: 0.35, speed: 0.25, agility: 0.20, endurance: 0.20 } },
    MB: { name: 'ミドルブロッカー', weights: { power: 0.35, agility: 0.30, speed: 0.20, strength: 0.15 } },
    OP: { name: 'オポジット', weights: { power: 0.40, strength: 0.25, agility: 0.20, speed: 0.15 } },
    L: { name: 'リベロ', weights: { agility: 0.40, speed: 0.30, endurance: 0.20, flexibility: 0.10 } }
};

// ═══════════════════════════════════════════════════════════════
// 【野球】
// ═══════════════════════════════════════════════════════════════
const baseballPositionRequirements: Record<string, PositionRequirement> = {
    P: { name: 'ピッチャー', weights: { power: 0.30, flexibility: 0.25, endurance: 0.20, core: 0.15, strength: 0.10 } },
    C: { name: 'キャッチャー', weights: { strength: 0.30, power: 0.25, agility: 0.20, endurance: 0.15, core: 0.10 } },
    '1B': { name: 'ファースト', weights: { power: 0.30, strength: 0.25, agility: 0.25, flexibility: 0.20 } },
    '2B': { name: 'セカンド', weights: { agility: 0.35, speed: 0.30, power: 0.20, flexibility: 0.15 } },
    '3B': { name: 'サード', weights: { power: 0.30, agility: 0.30, speed: 0.20, strength: 0.20 } },
    SS: { name: 'ショート', weights: { agility: 0.35, speed: 0.30, power: 0.20, flexibility: 0.15 } },
    LF: { name: 'レフト', weights: { speed: 0.30, power: 0.30, agility: 0.20, strength: 0.20 } },
    CF: { name: 'センター', weights: { speed: 0.40, agility: 0.25, power: 0.20, endurance: 0.15 } },
    RF: { name: 'ライト', weights: { power: 0.35, speed: 0.25, strength: 0.25, agility: 0.15 } }
};

// ═══════════════════════════════════════════════════════════════
// 【ラグビー】
// ═══════════════════════════════════════════════════════════════
const rugbyPositionRequirements: Record<string, PositionRequirement> = {
    PR: { name: 'プロップ', weights: { strength: 0.40, power: 0.30, core: 0.20, endurance: 0.10 } },
    HO: { name: 'フッカー', weights: { strength: 0.35, power: 0.25, agility: 0.20, core: 0.20 } },
    LO: { name: 'ロック', weights: { strength: 0.30, power: 0.30, endurance: 0.20, core: 0.20 } },
    FL: { name: 'フランカー', weights: { speed: 0.25, strength: 0.25, endurance: 0.25, agility: 0.25 } },
    NO8: { name: 'ナンバーエイト', weights: { power: 0.30, strength: 0.25, speed: 0.25, endurance: 0.20 } },
    SH: { name: 'スクラムハーフ', weights: { agility: 0.35, speed: 0.30, endurance: 0.20, power: 0.15 } },
    SO: { name: 'スタンドオフ', weights: { agility: 0.30, speed: 0.25, power: 0.25, endurance: 0.20 } },
    CTB: { name: 'センター', weights: { speed: 0.30, power: 0.30, strength: 0.20, agility: 0.20 } },
    WG: { name: 'ウイング', weights: { speed: 0.45, agility: 0.25, power: 0.20, endurance: 0.10 } },
    FB: { name: 'フルバック', weights: { speed: 0.30, agility: 0.30, power: 0.20, endurance: 0.20 } }
};

// ═══════════════════════════════════════════════════════════════
// 【ハンドボール】
// ═══════════════════════════════════════════════════════════════
const handballPositionRequirements: Record<string, PositionRequirement> = {
    GK: { name: 'ゴールキーパー', weights: { agility: 0.35, flexibility: 0.25, speed: 0.25, power: 0.15 } },
    LW: { name: '左ウイング', weights: { speed: 0.35, agility: 0.30, power: 0.20, endurance: 0.15 } },
    RW: { name: '右ウイング', weights: { speed: 0.35, agility: 0.30, power: 0.20, endurance: 0.15 } },
    LB: { name: '左バック', weights: { power: 0.35, speed: 0.25, strength: 0.20, agility: 0.20 } },
    RB: { name: '右バック', weights: { power: 0.35, speed: 0.25, strength: 0.20, agility: 0.20 } },
    CB: { name: 'センターバック', weights: { agility: 0.30, power: 0.25, endurance: 0.25, speed: 0.20 } },
    P: { name: 'ピボット', weights: { strength: 0.35, power: 0.30, core: 0.20, agility: 0.15 } }
};

// ═══════════════════════════════════════════════════════════════
// 【アメリカンフットボール】
// ═══════════════════════════════════════════════════════════════
const americanFootballPositionRequirements: Record<string, PositionRequirement> = {
    QB: { name: 'クォーターバック', weights: { power: 0.30, agility: 0.25, speed: 0.25, core: 0.20 } },
    RB: { name: 'ランニングバック', weights: { speed: 0.35, power: 0.30, agility: 0.25, strength: 0.10 } },
    WR: { name: 'ワイドレシーバー', weights: { speed: 0.40, agility: 0.30, power: 0.20, endurance: 0.10 } },
    TE: { name: 'タイトエンド', weights: { strength: 0.30, power: 0.25, speed: 0.25, agility: 0.20 } },
    OL: { name: 'オフェンシブライン', weights: { strength: 0.40, power: 0.30, core: 0.20, agility: 0.10 } },
    DL: { name: 'ディフェンシブライン', weights: { strength: 0.35, power: 0.35, agility: 0.20, speed: 0.10 } },
    LB: { name: 'ラインバッカー', weights: { speed: 0.25, strength: 0.25, agility: 0.25, power: 0.25 } },
    CB: { name: 'コーナーバック', weights: { speed: 0.40, agility: 0.35, endurance: 0.15, power: 0.10 } },
    S: { name: 'セーフティ', weights: { speed: 0.35, agility: 0.30, power: 0.20, endurance: 0.15 } },
    K: { name: 'キッカー', weights: { power: 0.40, flexibility: 0.30, core: 0.20, strength: 0.10 } }
};

// ═══════════════════════════════════════════════════════════════
// 【アイスホッケー】
// ═══════════════════════════════════════════════════════════════
const iceHockeyPositionRequirements: Record<string, PositionRequirement> = {
    GK: { name: 'ゴーリー', weights: { agility: 0.40, flexibility: 0.25, speed: 0.20, core: 0.15 } },
    D: { name: 'ディフェンス', weights: { strength: 0.30, power: 0.25, agility: 0.25, endurance: 0.20 } },
    LW: { name: 'レフトウイング', weights: { speed: 0.35, power: 0.25, agility: 0.25, endurance: 0.15 } },
    RW: { name: 'ライトウイング', weights: { speed: 0.35, power: 0.25, agility: 0.25, endurance: 0.15 } },
    C: { name: 'センター', weights: { agility: 0.30, speed: 0.25, endurance: 0.25, power: 0.20 } }
};

// 全ポジション定義をまとめた型
type PositionRequirements = {
    [sport: string]: Record<string, PositionRequirement>;
};

const allPositionRequirements: PositionRequirements = {
    soccer: soccerPositionRequirements,
    basketball: basketballPositionRequirements,
    volleyball: volleyballPositionRequirements,
    baseball: baseballPositionRequirements,
    softball: baseballPositionRequirements,  // 野球と同じ
    rugby: rugbyPositionRequirements,
    handball: handballPositionRequirements,
    american_football: americanFootballPositionRequirements,
    ice_hockey: iceHockeyPositionRequirements
};
```

### 4.6 ケガリスク評価

```typescript
function assessInjuryRisk(
    categoryScores: CategoryScores,
    athleteData: Athlete
): InjuryRiskAssessment {
    const risks: InjuryRiskAssessment['risks'] = [];

    // 柔軟性が低い場合
    if (categoryScores.flexibility < 40) {
        risks.push({
            area: '筋肉・腱',
            risk_level: categoryScores.flexibility < 30 ? 'high' : 'medium',
            reason: '柔軟性が低く、肉離れや腱の損傷リスクが上昇',
            prevention: 'ストレッチの強化、ウォームアップの徹底'
        });
    }

    // 体幹が弱い場合
    if (categoryScores.core < 40) {
        risks.push({
            area: '腰部',
            risk_level: categoryScores.core < 30 ? 'high' : 'medium',
            reason: '体幹筋力が弱く、腰痛のリスクが上昇',
            prevention: '体幹トレーニングの強化、姿勢改善'
        });
    }

    // 左右差が大きい場合（握力など）
    // ...

    // 総合リスク判定
    const highRisks = risks.filter(r => r.risk_level === 'high').length;
    const mediumRisks = risks.filter(r => r.risk_level === 'medium').length;

    let overall: 'low' | 'medium' | 'high';
    if (highRisks >= 2) overall = 'high';
    else if (highRisks >= 1 || mediumRisks >= 3) overall = 'medium';
    else overall = 'low';

    return { overall, risks };
}
```

---

## 5. 機能一覧

### 5.1 選手向け機能

| 機能 | 説明 |
|------|------|
| **マイページ** | 自分の測定履歴、スコア推移、目標進捗を確認 |
| **結果レポート閲覧** | 測定結果の詳細レポートをスマホで確認 |
| **トレーニングメニュー** | 弱点に合わせたパーソナライズされたトレーニング動画 |
| **目標設定** | シーズン目標の設定と進捗トラッキング |
| **通知** | 測定完了、目標達成などの通知 |

### 5.2 指導者向け機能

| 機能 | 説明 |
|------|------|
| **チームダッシュボード** | チーム全体のフィジカルデータ一覧 |
| **選手比較** | 複数選手のデータを比較表示 |
| **ポジション別分析** | ポジションごとの適性分析 |
| **シーズン推移** | シーズン通してのフィジカル変化をトラッキング |
| **ケガリスク管理** | 選手のケガリスクを一覧で管理 |
| **トレーニング計画** | チーム・個人別のトレーニングプラン作成 |
| **CSVエクスポート** | データのエクスポート |
| **レポート自動生成** | 保護者向け・選手向けレポートの自動生成 |

### 5.3 管理者向け機能

| 機能 | 説明 |
|------|------|
| **チーム管理** | チーム情報の編集、ロゴ設定 |
| **選手管理** | 選手の登録・編集・削除 |
| **測定管理** | 測定データの入力・編集 |
| **アカウント管理** | 指導者アカウントの作成・権限設定 |
| **統計分析** | チーム統計、学年別分析 |

---

## 6. 画面構成

### 6.1 ページ一覧

```
/                                  # ランディングページ
/login                            # ログイン
/team/[slug]                      # チームトップ
/team/[slug]/dashboard            # チームダッシュボード（指導者向け）
/team/[slug]/athletes             # 選手一覧
/team/[slug]/athletes/[id]        # 選手詳細
/team/[slug]/athletes/[id]/edit   # 選手編集
/team/[slug]/measure/new          # 新規測定
/team/[slug]/measure/[id]         # 測定詳細
/team/[slug]/measure/[id]/edit    # 測定編集
/team/[slug]/result/[id]          # 結果表示
/team/[slug]/compare              # 選手比較
/team/[slug]/training             # トレーニングメニュー
/team/[slug]/goals                # 目標管理
/team/[slug]/reports              # レポート一覧
/team/[slug]/admin                # 管理画面
/athlete/[id]                     # 選手マイページ（選手ログイン時）
```

### 6.2 レスポンシブ対応

- **PC**: 指導者向けダッシュボード、データ分析
- **タブレット**: 測定入力、チーム管理
- **スマートフォン**: 選手向けマイページ、結果確認

---

## 7. 結果表示

### 7.1 指導者向けレポート（チーム分析）

**ページ1: チームサマリー**
- チーム平均スコア（カテゴリ別レーダーチャート）
- 学年別フィジカル分布
- 前回測定との比較

**ページ2: 個人別スコア一覧**
- 選手一覧（総合スコア順/カテゴリ別）
- 成長度ランキング
- ケガリスク警告表示

**ページ3: ポジション別分析**
- ポジション適性マトリクス
- ポジションごとの理想値との比較

### 7.2 選手向けレポート

**ページ1: 総合結果**
- フィジカル年齢（大きく表示）
- 総合スコア（100点満点）
- カテゴリ別レーダーチャート
- 強み TOP3 / 弱み TOP3

**ページ2: 詳細分析**
- 各測定項目のスコアと偏差値
- 同学年平均との比較
- 前回からの成長度

**ページ3: トレーニング推奨**
- 優先トレーニングメニュー（動画付き）
- 1ヶ月後の目標値
- ケガ予防のポイント

---

## 8. ユーザー権限

### 8.1 ロール定義

| ロール | 説明 | 権限 |
|--------|------|------|
| **master** | システム管理者 | 全団体管理、全データアクセス |
| **partner** | パートナー企業 | 担当団体の管理 |
| **team_admin** | チーム管理者 | チームの全機能 |
| **coach** | コーチ | 測定・閲覧・分析 |
| **athlete** | 選手 | 自分のデータ閲覧のみ |
| **parent** | 保護者 | 子どものデータ閲覧のみ |

### 8.2 権限マトリクス

| 機能 | master | partner | team_admin | coach | athlete | parent |
|------|--------|---------|------------|-------|---------|--------|
| チーム作成 | ✓ | ✓ | - | - | - | - |
| 選手登録 | ✓ | ✓ | ✓ | ✓ | - | - |
| 測定入力 | ✓ | ✓ | ✓ | ✓ | - | - |
| 結果閲覧（全員） | ✓ | ✓ | ✓ | ✓ | - | - |
| 結果閲覧（自分） | - | - | - | - | ✓ | ✓ |
| 分析ダッシュボード | ✓ | ✓ | ✓ | ✓ | - | - |
| アカウント管理 | ✓ | ✓ | ✓ | - | - | - |
| CSVエクスポート | ✓ | ✓ | ✓ | ✓ | - | - |

---

## 9. 技術仕様

### 9.1 フロントエンド
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Recharts（グラフ）
- React Native（選手向けモバイルアプリ検討）

### 9.2 バックエンド
- Supabase (PostgreSQL + Auth + Storage)
- Next.js API Routes
- Edge Functions（通知、レポート生成）

### 9.3 外部連携（将来構想）
- Slack/LINE通知
- Google Fit / Apple HealthKit連携
- 動画分析AI連携

---

## 10. 料金プラン（想定）

| プラン | 月額 | 選手数上限 | 機能 |
|--------|------|----------|------|
| **スターター** | ¥9,800 | 30名 | 基本測定・分析 |
| **スタンダード** | ¥19,800 | 100名 | 全機能 |
| **プロ** | ¥39,800 | 300名 | 全機能 + API連携 + 専任サポート |
| **エンタープライズ** | 要相談 | 無制限 | カスタム開発対応 |

---

## 11. 今後の展開

### Phase 1（初期リリース）
- 基本測定・診断機能
- チームダッシュボード
- 選手管理

### Phase 2
- 選手向けモバイルアプリ
- トレーニング動画連携
- 目標管理機能

### Phase 3
- AI による成長予測
- ケガ予防アラート
- 他システム連携（学校管理システムなど）

---

## 付録: NOBISHIRO KIDS からの移行

既存の NOBISHIRO KIDS ユーザーがATHLETE に移行する場合：

1. **データ移行**: 小学生時代のデータを引き継ぎ、成長曲線を継続トラッキング
2. **アカウント連携**: 同一アカウントで両システムにアクセス可能
3. **ファミリープラン**: 兄弟で KIDS と ATHLETE を併用する場合の割引

---

*NOBISHIRO ATHLETE 仕様書 v1.0*
*作成日: 2025年12月17日*
