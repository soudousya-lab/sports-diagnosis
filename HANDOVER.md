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
- 運動タイプ診断（8タイプ）
- クラス判定（ビギナー/スタンダード/エキスパート）
- 弱点克服クラスの提案
- 適性スポーツTOP6（16種類から選定）
- 1ヶ月目標設定
- 発達段階別アドバイス（ゴールデンエイジ理論）
- 重点トレーニング提案（28種目DBから4種目選定）
- レーダーチャートによる可視化（前回比較機能付き）
- PDFレポート出力
- マルチ店舗対応

---

## 2. 技術スタック

| 分類 | 技術 | バージョン |
|------|------|-----------|
| フレームワーク | Next.js (App Router) | 15.x |
| 言語 | TypeScript | 5.x |
| スタイリング | Tailwind CSS | 4.x |
| データベース | Supabase (PostgreSQL) | - |
| 認証 | Supabase Auth | - |
| ホスティング | Vercel | - |
| ソース管理 | GitHub | - |

### カスタムTailwind設定
`tailwind.config.ts` に以下のカスタムブレークポイントが設定されています：
```typescript
screens: {
  'xs': '480px',  // モバイル対応用
  // sm, md, lg, xl, 2xl はデフォルト
}
```

---

## 3. リポジトリ構成

```
sports-diagnosis/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # ランディングページ
│   │   ├── layout.tsx                  # 共通レイアウト
│   │   ├── globals.css                 # グローバルCSS
│   │   ├── pricing/                    # 料金ページ
│   │   ├── contact/                    # お問い合わせページ
│   │   ├── terms/                      # 利用規約
│   │   ├── privacy/                    # プライバシーポリシー
│   │   ├── store/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx            # 店舗トップ（診断入力）
│   │   │       ├── login/              # 店舗ログイン
│   │   │       ├── admin/              # 店舗管理画面
│   │   │       └── results/            # 診断結果表示
│   │   ├── nbs-ctrl-8x7k2m/
│   │   │   ├── login/                  # マスター管理ログイン
│   │   │   └── master/                 # マスター管理画面
│   │   ├── auth/
│   │   │   └── reset-password/         # パスワードリセット
│   │   └── api/
│   │       ├── store/
│   │       │   └── account/            # 店舗アカウント更新API
│   │       ├── results/                # 診断結果API
│   │       └── measurement-dates/      # 測定日API
│   ├── components/
│   │   ├── DiagnosisForm.tsx           # 診断入力フォーム
│   │   ├── SimpleResult.tsx            # 簡易版結果表示
│   │   ├── DetailResult.tsx            # 詳細版結果表示
│   │   └── RadarChart.tsx              # レーダーチャート
│   └── lib/
│       ├── supabase.ts                 # Supabaseクライアント設定
│       ├── constants.ts                # 定数定義
│       ├── diagnosis.ts                # 診断ロジック
│       └── types.ts                    # TypeScript型定義
├── .env.local                          # 環境変数（ローカル用）
├── package.json
└── tsconfig.json
```

---

## 4. 外部サービス

### 4.1 Supabase（データベース・認証）

**ダッシュボード**: https://supabase.com/dashboard

**プロジェクト情報**:
- Project URL: `https://ebxikawxqdxackarzcdo.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（.env.localに記載）

### 4.2 Vercel（ホスティング）

**ダッシュボード**: https://vercel.com/soudousyas-projects/sports-diagnosis

**環境変数**（Vercel側で設定済み）:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**デプロイ**: GitHubへのpushで自動デプロイ

### 4.3 GitHub（ソースコード）

**リポジトリ**: https://github.com/soudousya-lab/sports-diagnosis

---

## 5. データベース詳細

### 主要テーブル

#### user_profiles
ユーザー情報を管理
```sql
- id (uuid, PK) - auth.users.id と同じ
- email (text)
- store_slug (text) - 所属店舗
- role (text) - 'master' | 'store_admin' | 'user'
- created_at (timestamptz)
```

#### stores（店舗）
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

#### students（生徒）
```sql
- id (uuid, PK)
- store_id (uuid, FK)
- name (text)
- furigana (text) - フリガナ（nullable）
- gender (text)
- birth_date (date)
- created_at (timestamptz)
```

#### measurements（測定）
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

#### trainings（トレーニングマスタ）
57種目が登録済み（7能力 × 2年齢層 × 2種目）

---

## 6. 認証システム

### ユーザータイプ
1. **マスター管理者** - システム全体の管理
2. **店舗管理者** - 各店舗の運営・管理

### 認証フロー
- Supabase Auth を使用
- セッション有効期限: 24時間（`SESSION_EXPIRY_SECONDS = 86400`）
- 店舗ログイン時は `store_slug` をセッションに保存

### 重要な注意点

#### Service Role Key の使用
店舗管理者のパスワード・メールアドレス変更は、クライアント側の `supabase.auth.updateUser()` ではなく、**API経由でService Role Key**を使用しています。

**理由**:
- クライアント側の更新は `auth.users` テーブルのみ更新
- `user_profiles` テーブルとの同期が取れなくなる問題があった
- Service Role Key を使用することで両テーブルを確実に更新

**該当ファイル**: `/src/app/api/store/account/route.ts`

```typescript
// Service Role Key でのユーザー更新
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// パスワード更新
await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword })

// メール更新（両テーブル）
await supabaseAdmin.auth.admin.updateUserById(userId, {
  email: newEmail,
  email_confirm: true
})
await supabaseAdmin.from('user_profiles').update({ email: newEmail }).eq('id', userId)
```

---

## 7. API エンドポイント

### PUT /api/store/account
店舗管理者のアカウント情報更新

**リクエスト（パスワード変更）:**
```json
{
  "action": "password",
  "currentPassword": "current_password",
  "newPassword": "new_password"
}
```

**リクエスト（メール変更）:**
```json
{
  "action": "email",
  "currentPassword": "current_password",
  "newEmail": "new@example.com"
}
```

### GET /api/results/[studentId]
生徒の診断結果取得

### GET /api/measurement-dates
測定日一覧取得

---

## 8. 診断ロジック

### 8.1 偏差値計算

```typescript
偏差値 = 50 + 10 × (測定値 - 平均値) / 標準偏差
```

※ダッシュのみ逆転（タイムが短いほど高評価）

**平均値・標準偏差**: `src/lib/diagnosis.ts` の `averageData` と `sd` に定義

### 8.2 10段階評価

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

### 8.3 運動器年齢

```typescript
運動器年齢 = 実年齢 + (平均評点 - 5) × 0.8
```

### 8.4 クラス判定

| 条件 | クラス |
|------|--------|
| 平均評点 < 5 | ビギナー |
| 平均評点 5〜7 | スタンダード |
| 平均評点 ≥ 7 かつ 最低評点 ≥ 5 | エキスパート |

### 8.5 運動タイプ（8タイプ）

評点の平均と分布から判定

---

## 9. レスポンシブ対応

### ブレークポイント
- `xs`: 480px（モバイル）
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### 実装パターン
```tsx
// テーブルの列を画面サイズで表示/非表示
<th className="hidden sm:table-cell">メール</th>
<th className="hidden md:table-cell">作成日</th>

// パディング・フォントサイズの調整
<div className="p-3 xs:p-4 sm:p-6">
  <h1 className="text-lg xs:text-xl sm:text-2xl">
```

---

## 10. 環境構築手順

### 10.1 ローカル開発

```bash
# リポジトリクローン
git clone https://github.com/soudousya-lab/sports-diagnosis.git
cd sports-diagnosis

# 依存関係インストール
npm install

# 環境変数設定（.env.localを作成）
NEXT_PUBLIC_SUPABASE_URL=https://ebxikawxqdxackarzcdo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# 開発サーバー起動
npm run dev

# ビルド
npm run build
```

### 10.2 デプロイ

GitHubにpushすると自動的にVercelでデプロイされます。

```bash
git add .
git commit -m "変更内容"
git push origin main
```

---

## 11. 既知の問題と対処法

### 1. ログインが固まる問題
**原因**: 複数の `onAuthStateChange` リスナーが競合
**対処**: 各ページで一つのリスナーのみ使用し、適切にクリーンアップ

### 2. フリガナがnullの場合のエラー
**原因**: 既存データにフリガナが登録されていない
**対処**: `furigana || ''` でnullを空文字に変換

### 3. メール更新後にログインできない
**原因**: `auth.users` と `user_profiles` の不整合
**対処**: API経由で両テーブルを同時更新（上記参照）

---

## 12. 注意事項

### セキュリティ

- `SUPABASE_SERVICE_ROLE_KEY` は絶対に公開しない
- 環境変数はVercelダッシュボードで管理
- 店舗管理者認証はSupabase Auth + user_profilesで実装済み

### データ

- 測定データは削除機能あり（管理画面から操作可能）
- 児童の個人情報取り扱いに注意

### パフォーマンス

- レーダーチャートはCanvas描画（SSR非対応）
- 大量データ時はページネーション実装済み

---

## 13. 連絡先・参考情報

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
**最終更新**: 2025年1月
**作成者**: Claude Code
