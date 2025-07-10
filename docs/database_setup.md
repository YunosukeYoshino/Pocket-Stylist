# データベースセットアップ・マイグレーション

## 概要

Pocket Stylist AIのデータベースセットアップ手順とマイグレーション管理について説明します。

## 前提条件

- PostgreSQL 15以上
- 管理者権限を持つデータベースユーザー
- マイグレーションツール（推奨: Prisma、Drizzle、または knex.js）

## 初期セットアップ

### 1. データベース作成

```sql
-- 開発環境
CREATE DATABASE pocket_stylist_dev;
CREATE USER pocket_stylist_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE pocket_stylist_dev TO pocket_stylist_user;

-- テスト環境
CREATE DATABASE pocket_stylist_test;
GRANT ALL PRIVILEGES ON DATABASE pocket_stylist_test TO pocket_stylist_user;

-- 本番環境
CREATE DATABASE pocket_stylist_prod;
GRANT ALL PRIVILEGES ON DATABASE pocket_stylist_prod TO pocket_stylist_user;
```

### 2. 拡張機能の有効化

```sql
-- UUID生成のため
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 全文検索のため
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ベクトル検索のため（AI機能用）
CREATE EXTENSION IF NOT EXISTS "vector";
```

## マイグレーションファイル

### 001_initial_schema.sql

```sql
-- users テーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    auth0_id VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    birth_date DATE,
    phone VARCHAR(20),
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- body_profiles テーブル
CREATE TABLE body_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    height INTEGER CHECK (height > 0 AND height < 300),
    weight INTEGER CHECK (weight > 0 AND weight < 500),
    body_type VARCHAR(50),
    skin_tone VARCHAR(50),
    measurements JSONB,
    fit_preferences VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- garments テーブル
CREATE TABLE garments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    brand VARCHAR(100),
    color VARCHAR(50),
    size VARCHAR(20),
    material VARCHAR(100),
    price DECIMAL(10,2) CHECK (price >= 0),
    image_url TEXT,
    tags JSONB,
    condition VARCHAR(20) CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tryons テーブル
CREATE TABLE tryons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body_profile_id UUID NOT NULL REFERENCES body_profiles(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    garment_ids JSONB NOT NULL,
    ai_analysis TEXT,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tryon_results テーブル
CREATE TABLE tryon_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tryon_id UUID NOT NULL REFERENCES tryons(id) ON DELETE CASCADE,
    result_image_url TEXT NOT NULL,
    overlay_data TEXT,
    fit_analysis JSONB,
    rating DECIMAL(2,1) CHECK (rating >= 1.0 AND rating <= 5.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- outfits テーブル
CREATE TABLE outfits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    occasion VARCHAR(50),
    season VARCHAR(20) CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
    weather VARCHAR(50),
    ai_description TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- outfit_items テーブル
CREATE TABLE outfit_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    garment_id UUID NOT NULL REFERENCES garments(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(outfit_id, garment_id)
);

-- orders テーブル
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded')),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- order_items テーブル
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    garment_id UUID NOT NULL REFERENCES garments(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 002_indexes.sql

```sql
-- パフォーマンス向上のためのインデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth0_id ON users(auth0_id);
CREATE INDEX idx_body_profiles_user_id ON body_profiles(user_id);
CREATE INDEX idx_garments_user_id ON garments(user_id);
CREATE INDEX idx_garments_category ON garments(category);
CREATE INDEX idx_garments_tags ON garments USING GIN(tags);
CREATE INDEX idx_tryons_user_id ON tryons(user_id);
CREATE INDEX idx_tryons_session_id ON tryons(session_id);
CREATE INDEX idx_outfits_user_id ON outfits(user_id);
CREATE INDEX idx_outfit_items_outfit_id ON outfit_items(outfit_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- 全文検索インデックス
CREATE INDEX idx_garments_name_trgm ON garments USING GIN(name gin_trgm_ops);
CREATE INDEX idx_garments_brand_trgm ON garments USING GIN(brand gin_trgm_ops);
```

### 003_triggers.sql

```sql
-- updated_at 自動更新のためのトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの適用
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_body_profiles_updated_at BEFORE UPDATE ON body_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_garments_updated_at BEFORE UPDATE ON garments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tryons_updated_at BEFORE UPDATE ON tryons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outfits_updated_at BEFORE UPDATE ON outfits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## シードデータ

### seed_data.sql

```sql
-- サンプルユーザー（開発環境用）
INSERT INTO users (id, email, name, auth0_id, gender, preferences) VALUES
(
    '123e4567-e89b-12d3-a456-426614174000',
    'demo@pocket-stylist.com',
    'デモユーザー',
    'auth0|demo123',
    'other',
    '{"style": "casual", "colors": ["navy", "gray", "white"], "brands": ["Uniqlo", "Muji"]}'
);

-- サンプルボディプロファイル
INSERT INTO body_profiles (user_id, height, weight, body_type, skin_tone, measurements, fit_preferences) VALUES
(
    '123e4567-e89b-12d3-a456-426614174000',
    165,
    60,
    'athletic',
    'warm',
    '{"chest": 88, "waist": 70, "hips": 92}',
    'regular'
);

-- サンプル衣服データ
INSERT INTO garments (user_id, name, category, subcategory, brand, color, size, material, price, tags, condition) VALUES
(
    '123e4567-e89b-12d3-a456-426614174000',
    'ホワイトシャツ',
    'tops',
    'shirt',
    'Uniqlo',
    'white',
    'M',
    'cotton',
    2990.00,
    '["casual", "work", "basic"]',
    'new'
),
(
    '123e4567-e89b-12d3-a456-426614174000',
    'ダークデニム',
    'bottoms',
    'jeans',
    'Muji',
    'indigo',
    'M',
    'denim',
    4990.00,
    '["casual", "durable"]',
    'like_new'
);
```

## マイグレーション実行

### 手動実行

```bash
# 1. データベースに接続
psql -h localhost -U pocket_stylist_user -d pocket_stylist_dev

# 2. マイグレーションファイルを順次実行
\i migrations/001_initial_schema.sql
\i migrations/002_indexes.sql
\i migrations/003_triggers.sql

# 3. シードデータの投入（開発環境のみ）
\i seeds/seed_data.sql
```

### 自動化スクリプト

```bash
# migrate.sh
#!/bin/bash
set -e

DB_URL="${DATABASE_URL:-postgresql://pocket_stylist_user:password@localhost:5432/pocket_stylist_dev}"

echo "Starting database migration..."

# Run migration files in order
for file in migrations/*.sql; do
    echo "Applying $file..."
    psql "$DB_URL" -f "$file"
done

if [ "$NODE_ENV" != "production" ]; then
    echo "Loading seed data..."
    psql "$DB_URL" -f "seeds/seed_data.sql"
fi

echo "Migration completed successfully!"
```

## バックアップ・復元

### バックアップ

```bash
# 本番環境バックアップ
pg_dump -h localhost -U pocket_stylist_user -d pocket_stylist_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# 圧縮バックアップ
pg_dump -h localhost -U pocket_stylist_user -d pocket_stylist_prod | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 復元

```bash
# SQLファイルから復元
psql -h localhost -U pocket_stylist_user -d pocket_stylist_dev < backup_20240101_120000.sql

# 圧縮ファイルから復元
gunzip -c backup_20240101_120000.sql.gz | psql -h localhost -U pocket_stylist_user -d pocket_stylist_dev
```

## 運用注意事項

1. **マイグレーション**
   - 本番環境適用前に必ずステージング環境でテスト
   - ダウンタイムが必要な変更は事前通知
   - バックアップを取得してから実行

2. **パフォーマンス**
   - EXPLAIN ANALYZE を使用してクエリパフォーマンスを監視
   - 定期的なVACUUM とANALYZE の実行
   - インデックスの使用状況を定期確認

3. **セキュリティ**
   - データベースユーザーの権限は最小限に
   - 機密データのマスキング（開発環境コピー時）
   - アクセスログの監視