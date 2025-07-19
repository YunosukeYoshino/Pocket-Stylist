# Pocket Stylist API Server

RESTful APIサーバーの実装です。ユーザー管理、認証、体型プロフィール管理のためのエンドポイントを提供します。

## 🚀 技術スタック

- **Runtime**: Bun
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + Auth0
- **Validation**: Zod
- **Language**: TypeScript

## 📦 セットアップ

### 1. 環境変数の設定

`.env`ファイルを作成し、必要な環境変数を設定してください：

```bash
cp .env.example .env
```

必要な環境変数：
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pocket_stylist?schema=public"

# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.pocket-stylist.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:19000,exp://localhost:19000
```

### 2. データベースの準備

```bash
# Prismaクライアントの生成
bun run db:generate

# データベースマイグレーション実行
bun run db:migrate

# 初期データの投入（オプション）
bun run db:seed
```

### 3. サーバーの起動

```bash
# 開発環境での起動
bun run server:dev

# 本番環境での起動
bun run server
```

## 📖 API仕様

### ベースURL
```
http://localhost:3000/v1
```

### 認証
ほとんどのエンドポイントではBearerトークンによる認証が必要です：

```
Authorization: Bearer <your_jwt_token>
```

## 🔐 認証エンドポイント

### POST /v1/auth/login
ユーザーログイン

**リクエスト:**
```json
{
  "auth0Id": "auth0|user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**レスポンス:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatarUrl": "https://example.com/avatar.jpg"
    },
    "message": "Login successful"
  },
  "timestamp": "2025-07-11T16:00:00.000Z"
}
```

### POST /v1/auth/refresh
トークンの更新

**リクエスト:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

### POST /v1/auth/logout
ログアウト（認証必要）

### GET /v1/auth/validate
トークンの検証（認証必要）

### GET /v1/auth/me
現在のユーザー情報取得（認証必要）

## 👤 ユーザー管理エンドポイント

### GET /v1/users/profile
ユーザープロフィール取得（認証必要）

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "gender": "male",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "phone": "+81-90-1234-5678",
    "preferences": {
      "style": "casual",
      "colors": ["blue", "black"]
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": "2025-07-11T16:00:00.000Z"
}
```

### PATCH /v1/users/profile
ユーザープロフィール更新（認証必要）

**リクエスト:**
```json
{
  "name": "John Smith",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "gender": "male",
  "birthDate": "1990-01-01T00:00:00.000Z",
  "phone": "+81-90-1234-5678",
  "preferences": {
    "style": "formal",
    "colors": ["navy", "gray"]
  }
}
```

### DELETE /v1/users/profile
ユーザーアカウント削除（認証必要）

## 📏 体型プロフィールエンドポイント

### GET /v1/users/body-profile
体型プロフィール取得（認証必要）

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "height": 175,
    "weight": 70,
    "bodyType": "athletic",
    "skinTone": "warm",
    "measurements": {
      "chest": 96,
      "waist": 82,
      "hips": 92
    },
    "fitPreferences": "regular",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": "2025-07-11T16:00:00.000Z"
}
```

### POST /v1/users/body-profile
体型プロフィール作成（認証必要）

**リクエスト:**
```json
{
  "height": 175,
  "weight": 70,
  "bodyType": "athletic",
  "skinTone": "warm",
  "measurements": {
    "chest": 96,
    "waist": 82,
    "hips": 92
  },
  "fitPreferences": "regular"
}
```

### PATCH /v1/users/body-profile
体型プロフィール更新（認証必要）

### DELETE /v1/users/body-profile
体型プロフィール削除（認証必要）

## 🛠️ ヘルスチェック

### GET /health
サーバーの稼働状況確認

**レスポンス:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-11T16:00:00.000Z"
}
```

## 🏗️ アーキテクチャ

### ディレクトリ構造
```
server/
├── index.ts              # エントリーポイント
├── middleware/           # ミドルウェア
│   ├── auth.ts          # 認証ミドルウェア
│   ├── errorHandler.ts  # エラーハンドラー
│   └── notFoundHandler.ts
├── routes/              # APIルート
│   ├── auth.ts         # 認証ルート
│   ├── users.ts        # ユーザー管理ルート
│   └── body-profile.ts # 体型プロフィールルート
├── services/            # ビジネスロジック
│   ├── auth.ts
│   ├── user.ts
│   └── bodyProfile.ts
├── repositories/        # データアクセス層
│   ├── base.ts
│   ├── user.ts
│   └── bodyProfile.ts
├── schemas/             # データ検証スキーマ
│   └── user.ts
└── tsconfig.json       # TypeScript設定
```

### 設計パターン
- **リポジトリパターン**: データアクセスの抽象化
- **サービス層**: ビジネスロジックの分離
- **ミドルウェア**: 横断的関心事の処理
- **バリデーション**: Zodによる型安全なデータ検証

## 🔒 セキュリティ

- **JWT認証**: Auth0による認証システム
- **CORS**: 適切なCORS設定
- **Helmet**: セキュリティヘッダーの設定
- **レート制限**: API呼び出し制限
- **入力検証**: Zodによる厳密なバリデーション

## 📊 エラーハンドリング

すべてのエラーは統一されたフォーマットで返されます：

```json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2025-07-11T16:00:00.000Z",
  "path": "/v1/users/profile",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "invalid_string"
    }
  ]
}
```

## 🧪 開発

### 型チェック
```bash
bun run type-check
```

### コードフォーマット・リンティング
```bash
bun run check:fix
```

### テスト実行
```bash
bun run test
```

## 📝 ログ

サーバーは構造化ログを出力します：
- リクエスト/レスポンスログ
- エラーログ
- データベース操作ログ
- 認証ログ

## 🚀 デプロイ

### Docker
```bash
# Dockerイメージのビルド
docker build -t pocket-stylist-api .

# コンテナの起動
docker run -p 3000:3000 --env-file .env pocket-stylist-api
```

### Docker Compose
```bash
# サービスの起動
bun run docker:up

# ログの確認
bun run docker:logs
```

## 🤝 貢献

1. Issueを作成してバグレポートまたは機能要求を提出
2. フィーチャーブランチを作成
3. 変更を実装
4. テストとリンティングを実行
5. プルリクエストを作成

## 📄 ライセンス

MIT License