# スポーツ能力診断システム - 開発引き継ぎ資料

## 1. システム概要

### 概要
子ども（年中〜小学6年生）の体力測定結果を入力し、運動能力を科学的に診断するWebシステム。

### 本番環境
- **URL**: https://sports-diagnosis.vercel.app
- **店舗ページ例**: https://sports-diagnosis.vercel.app/store/okayama-main

### 主な機能
- 運動器年齢の算出
- 10段階評価・偏差値計算
- 運動タイプ診断（11タイプ）
- クラス判定（ビギナー/スタンダード/エキスパート）
- 弱点克服クラスの提案
- 適性スポーツTOP6（16種類から選定）
- 1ヶ月目標設定
- 発達段階別アドバイス（ゴールデンエイジ理論）
- 重点トレーニング提案（28種目DBから4種目選定）

---

## 2. 技術スタック

| 分類 | 技術 | バージョン |
|------|------|-----------|
| フレームワーク | Next.js (App Router) | 15.x |
| 言語 | TypeScript | 5.x |
| スタイリング | Tailwind CSS | 4.x |
| データベース | Supabase (PostgreSQL) | - |
| ホスティング | Vercel | - |
| ソース管理 | GitHub | - |

---

## 3. リポジトリ構成

```
sports-diagnosis/
├── src/
│   ├── app/
│   │   ├── page.tsx              # トップページ（店舗一覧）
│   │   ├── layout.tsx            # 共通レイアウト
│   │   ├── globals.css           # グローバルCSS
│   │   └── store/
│   │       └── [slug]/
│   │           └── page.tsx      # 店舗別診断ページ
│   ├── components/
│   │   ├── DiagnosisForm.tsx     # 診断入力フォーム
│   │   ├── SimpleResult.tsx      # 簡易版結果表示
│   │   ├── DetailResult.tsx      # 詳細版結果表示
│   │   └── RadarChart.tsx        # レーダーチャート
│   └── lib/
│       ├── supabase.ts           # Supabaseクライアント・型定義
│       └── diagnosis.ts          # 診断ロジック
├── supabase/
│   └── schema.sql                # データベーススキーマ
├── .env.local                    # 環境変数（ローカル用）
├── package.json
└── tsconfig.json
```

---

## 4. 外部サービス

### 4.1 Supabase（データベース）

**ダッシュボード**: https://supabase.com/dashboard

**プロジェクト情報**:
- Project URL: `https://ebxikawxqdxackarzcdo.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（.env.localに記載）

**テーブル構成**:

| テーブル | 説明 | 主なカラム |
|---------|------|-----------|
| `stores` | 店舗情報 | id, name, slug, logo_url, address, phone, hours, theme_color |
| `store_admins` | 店舗管理者 | id, store_id, email, password_hash |
| `children` | 児童情報 | id, store_id, name, furigana, gender, grade, height, weight |
| `measurements` | 測定記録 | id, child_id, store_id, mode, grip_right, grip_left, jump, dash, ... |
| `results` | 診断結果 | id, measurement_id, motor_age, type_name, class_level, scores(JSON), ... |
| `trainings` | トレーニングマスタ | id, ability_key, age_group, name, description, reps, effect |

### 4.2 Vercel（ホスティング）

**ダッシュボード**: https://vercel.com/soudousyas-projects/sports-diagnosis

**環境変数**（Vercel側で設定済み）:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**デプロイ**: GitHubへのpushで自動デプロイ

### 4.3 GitHub（ソースコード）

**リポジトリ**: https://github.com/soudousya-lab/sports-diagnosis

---

## 5. データベース詳細

### 5.1 stores（店舗）

```sql
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,  -- URL用 (例: okayama-main)
  logo_url TEXT,
  line_qr_url TEXT,
  address TEXT,
  phone VARCHAR(20),
  hours TEXT,
  theme_color VARCHAR(7) DEFAULT '#003366',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**登録済み店舗**:
| slug | name |
|------|------|
| okayama-main | かけっこ体幹教室 岡山本店 |
| okayama-sub | FIREFITNESS |

### 5.2 measurements（測定）

7項目の測定値を保存:

| カラム | 項目 | 単位 | 備考 |
|--------|------|------|------|
| grip_right | 握力（右） | kg | |
| grip_left | 握力（左） | kg | |
| jump | 立ち幅跳び | cm | |
| dash | 15mダッシュ | 秒 | タイムは小さいほど良い |
| doublejump | 連続立ち幅跳び | cm | 詳細版のみ |
| squat | 30秒スクワット | 回 | 詳細版のみ |
| sidestep | 反復横跳び | 回 | 詳細版のみ |
| throw | ボール投げ | m | 詳細版のみ |

### 5.3 trainings（トレーニングマスタ）

28種目が登録済み（7能力 × 2年齢層 × 2種目）

| ability_key | 能力名 |
|-------------|--------|
| grip | 筋力 |
| jump | 瞬発力 |
| dash | 移動能力 |
| doublejump | バランス |
| squat | 筋持久力 |
| sidestep | 敏捷性 |
| throw | 投力 |

| age_group | 対象 |
|-----------|------|
| young | 年中〜小2 |
| old | 小3〜小6 |

---

## 6. 診断ロジック

### 6.1 偏差値計算

```typescript
偏差値 = 50 + 10 × (測定値 - 平均値) / 標準偏差
```

※ダッシュのみ逆転（タイムが短いほど高評価）

**平均値・標準偏差**: `src/lib/diagnosis.ts` の `averageData` と `sd` に定義

### 6.2 10段階評価

| 偏差値 | 評点 |
|--------|------|
| 70以上 | 10 |
| 65-69 | 9 |
| 60-64 | 8 |
| 55-59 | 7 |
| 50-54 | 6 |
| 45-49 | 5 |
| 40-44 | 4 |
| 35-39 | 3 |
| 30-34 | 2 |
| 30未満 | 1 |

### 6.3 運動器年齢

```typescript
運動器年齢 = 実年齢 + (平均評点 - 5) × 0.8
```

### 6.4 クラス判定

| 条件 | クラス |
|------|--------|
| 平均評点 < 5 | ビギナー |
| 平均評点 5〜7 | スタンダード |
| 平均評点 ≥ 7 かつ 最低評点 ≥ 5 | エキスパート |

### 6.5 運動タイプ（11タイプ）

評点の平均と分布から判定:

- オールラウンドエリート型（平均8以上）
- パワーファイター型（筋力優位）
- スタミナエリート型（筋持久力優位）
- リアクションスター型（敏捷性優位）
- バランスマスター型（バランス優位）
- ジャンプエリート型（瞬発力優位）
- スピードスター型（移動能力優位）
- スローイングエース型（投力優位）
- バランスアスリート型（平均6以上、バランス良）
- 成長アスリート型（平均4以上）
- ポテンシャル型（その他）

### 6.6 適性スポーツ

16種類のスポーツに対して、必要能力の評点平均で適性度を算出:

```typescript
const allSports = [
  { name: 'サッカー', required: ['dash', 'squat', 'sidestep'], icon: '⚽' },
  { name: '野球', required: ['throw', 'grip', 'sidestep'], icon: '⚾' },
  // ... 全16種類
]
```

---

## 7. 2段階システム

### 7.1 簡易版（イベント用）

**測定項目**: 3項目（握力、立ち幅跳び、15mダッシュ）

**表示内容**:
- 運動器年齢
- 運動タイプ
- おすすめクラス
- 詳細診断への誘導CTA

### 7.2 詳細版（店舗用）

**測定項目**: 7項目すべて

**表示内容**:
- 全測定結果と評価
- レーダーチャート
- 強み・弱み分析
- スポーツテスト予測
- 適性スポーツTOP6
- 重点トレーニング4種目
- 保護者向けアドバイス
- 1ヶ月目標

---

## 8. 主要ファイル解説

### 8.1 src/lib/supabase.ts

Supabaseクライアントの初期化と型定義。

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Store = { ... }
export type Child = { ... }
export type Measurement = { ... }
export type Result = { ... }
export type Training = { ... }
```

### 8.2 src/lib/diagnosis.ts

全診断ロジックを集約。

主要関数:
- `calcDeviation()` - 偏差値計算
- `deviationTo10Scale()` - 10段階評価変換
- `calcMotorAge()` - 運動器年齢計算
- `determineType()` - 運動タイプ判定
- `determineClass()` - クラス判定
- `calcSportsAptitude()` - 適性スポーツ計算
- `runDiagnosis()` - 診断実行（統合）

### 8.3 src/app/store/[slug]/page.tsx

店舗別診断ページのメインロジック。

処理フロー:
1. URL slugから店舗データ取得
2. トレーニングマスタ取得
3. フォーム入力受付
4. 診断ロジック実行
5. DB保存（children → measurements → results）
6. 結果表示

### 8.4 src/components/DiagnosisForm.tsx

診断入力フォーム。簡易版/詳細版のモード切替機能付き。

### 8.5 src/components/SimpleResult.tsx / DetailResult.tsx

診断結果表示コンポーネント。モードに応じて使い分け。

---

## 9. 環境構築手順

### 9.1 ローカル開発

```bash
# リポジトリクローン
git clone https://github.com/soudousya-lab/sports-diagnosis.git
cd sports-diagnosis

# 依存関係インストール
npm install

# 環境変数設定（.env.localを作成）
NEXT_PUBLIC_SUPABASE_URL=https://ebxikawxqdxackarzcdo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# 開発サーバー起動
npm run dev
```

### 9.2 デプロイ

GitHubにpushすると自動的にVercelでデプロイされます。

```bash
git add .
git commit -m "変更内容"
git push origin main
```

---

## 10. 今後の開発予定

### 優先度高

1. **管理画面**
   - 店舗設定（ロゴ、連絡先、LINEのQR等）
   - 測定データ一覧・検索
   - 認証機能（店舗管理者ログイン）

2. **履歴管理**
   - 同一児童の過去データ紐付け
   - 成長グラフ表示

### 優先度中

3. **店舗追加機能**
   - 管理画面から新規店舗登録
   - サブドメイン or パス型URLの選択

4. **印刷最適化**
   - PDF出力機能
   - 印刷用スタイル調整

### 優先度低

5. **予約連携**
   - 詳細診断の予約機能
   - LINE連携

6. **独自ドメイン**
   - Vercelでカスタムドメイン設定

---

## 11. 注意事項

### セキュリティ

- `SUPABASE_SERVICE_ROLE_KEY` は絶対に公開しない
- 現在のRLSポリシーは開発用（本番運用前に見直し必要）
- 店舗管理者認証は未実装

### データ

- 測定データは削除機能なし（必要に応じて実装）
- 児童の個人情報取り扱いに注意

### パフォーマンス

- レーダーチャートはCanvas描画（SSR非対応）
- 大量データ時のページネーション未実装

---

## 12. 連絡先・参考情報

### サービスダッシュボード

| サービス | URL |
|---------|-----|
| Vercel | https://vercel.com/soudousyas-projects/sports-diagnosis |
| Supabase | https://supabase.com/dashboard |
| GitHub | https://github.com/soudousya-lab/sports-diagnosis |

### 参考ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**作成日**: 2024年12月11日
**作成者**: Claude Code
