# よくある CI の問題と解決方法

プロジェクトでよく遭遇する CI 関連の問題と、その解決方法をまとめています。

## 📋 TypeScript 関連

### 1. Jest Mock の型エラー

**症状**:
```
TS2345: Argument of type 'X' is not assignable to parameter of type 'never'
```

**原因**: Jest の `mockResolvedValue()` が型推論に失敗

**解決方法**:
```typescript
// ❌ 問題のあるコード
jest.fn().mockResolvedValue(null)

// ✅ 修正後
jest.fn(() => Promise.resolve(null))
```

### 2. 環境変数アクセスの型エラー

**症状**:
```
Property 'SOME_VAR' does not exist on type 'ProcessEnv'
```

**解決方法**:
```typescript
// env.ts で型定義
export const env = {
  SOME_VAR: process.env.SOME_VAR || '',
  // ...
}
```

### 3. Prisma 型の import エラー

**症状**:
```
Module '"@prisma/client"' has no exported member 'SomeType'
```

**解決方法**:
```typescript
// prisma generate 後に利用可能になる型
import type { User } from '@prisma/client'
// または
const user: any = await prisma.user.findFirst()
```

## 🔧 Linting 関連

### 1. Biome の process.env エラー

**症状**:
```
The computed expression can be simplified without the use of a string literal
```

**解決方法**:
```typescript
// ❌ エラー
process.env['NODE_ENV']

// ✅ 修正
process.env.NODE_ENV
```

### 2. Non-null assertion 警告

**症状**:
```
Forbidden non-null assertion
```

**解決方法**:
```typescript
// ❌ 警告
value!.property

// ✅ 安全
value?.property || defaultValue
```

### 3. Any 型の警告

**症状**:
```
Unexpected any. Specify a different type
```

**解決方法**:
```typescript
// 一時的な回避（本来は適切な型定義が望ましい）
(value as any).property

// または unknown を使用
(value as unknown as ExpectedType).property
```

## 🗄️ データベース関連

### 1. Migration 失敗

**症状**: `Migration failed to apply`

**解決方法**:
```bash
# Migration をリセット
npx prisma migrate reset

# 新しい migration を生成
npx prisma migrate dev --name fix_schema
```

### 2. Prisma Client の生成エラー

**症状**: `Prisma Client is not generated`

**解決方法**:
```bash
# CI で Prisma Client を生成
npx prisma generate
```

### 3. データベース接続エラー

**原因**: 環境変数の設定ミス

**解決方法**:
```yaml
# GitHub Actions で環境変数を設定
env:
  DATABASE_URL: postgresql://user:pass@localhost:5432/testdb
```

## 📦 依存関係関連

### 1. パッケージの競合

**症状**: `Conflicting peer dependencies`

**解決方法**:
```bash
# Lock ファイルをクリア
rm package-lock.json
npm install

# または bun の場合
rm bun.lock
bun install
```

### 2. Node.js バージョンの不一致

**症状**: `Unsupported Node.js version`

**解決方法**:
```yaml
# .github/workflows/ci.yml
- name: Setup Node
  uses: actions/setup-node@v3
  with:
    node-version: '18'
```

### 3. パッケージマネージャーの不一致

**症状**: CI でローカルと異なる動作

**解決方法**:
```yaml
# 一貫したパッケージマネージャーを使用
- name: Setup Bun
  uses: oven-sh/setup-bun@v1
```

## 🔄 ワークフロー関連

### 1. 並列ジョブの依存関係

**問題**: データベースが準備される前にテストが実行される

**解決方法**:
```yaml
jobs:
  test:
    needs: [database-setup]
    # ...
```

### 2. キャッシュの問題

**症状**: 古い依存関係がキャッシュされる

**解決方法**:
```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### 3. 環境変数の範囲

**問題**: 特定のジョブでのみ環境変数が必要

**解決方法**:
```yaml
jobs:
  backend-test:
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
    steps:
      # ...
```

## 🚀 パフォーマンス最適化

### 1. ビルド時間の短縮

**方法**:
```yaml
# 必要な部分のみをビルド
- name: Build backend only
  run: cd backend && npm run build

# 並列実行
strategy:
  matrix:
    component: [frontend, backend]
```

### 2. テスト実行時間の短縮

**方法**:
```bash
# 並列テスト実行
jest --maxWorkers=4

# 変更されたファイルのみテスト
jest --onlyChanged
```

### 3. 依存関係のキャッシュ

**方法**:
```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

## 🛡️ セキュリティ関連

### 1. Secret の漏洩防止

**ベストプラクティス**:
```yaml
# Secret を環境変数として設定
env:
  API_KEY: ${{ secrets.API_KEY }}

# ログに出力されないようマスク
- name: Use secret
  run: |
    echo "::add-mask::$API_KEY"
    # API_KEY を使用
```

### 2. 依存関係の脆弱性

**対策**:
```bash
# 定期的な脆弱性チェック
npm audit

# 自動修正
npm audit fix
```

## 📊 モニタリング

### 1. CI の実行時間監視

**方法**:
- GitHub Actions の usage を定期的にチェック
- 長時間実行されるジョブを特定
- ボトルネックを分析して最適化

### 2. 失敗率の追跡

**方法**:
- 失敗したワークフローの原因を分類
- よくある問題のパターンを特定
- 予防策を実装

---

このリストは継続的に更新され、新しい問題が発見されるたびに追加されます。