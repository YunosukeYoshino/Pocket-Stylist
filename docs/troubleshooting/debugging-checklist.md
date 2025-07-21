# デバッグチェックリスト

CI/CD パイプラインで問題が発生した際の体系的なデバッグ手順です。

## 🔍 初期診断

### 1. 問題の範囲特定
- [ ] エラーが発生しているジョブ/ステップを特定
- [ ] ローカル環境で同じ問題が再現するか確認
- [ ] 最近のコミットとの関連性を調査

### 2. ログ分析
```bash
# 詳細なCI ログを取得
gh run view [RUN_ID] --log

# エラー箇所に絞り込み
gh run view [RUN_ID] --log | grep -A10 -B10 "error\|Error\|FAILED"

# 特定のステップのログを確認
gh run view [RUN_ID] --log | grep -A50 "Step Name"
```

## 🛠️ TypeScript/Jest 関連エラー

### TypeScript コンパイルエラー
- [ ] `tsc --noEmit` でローカル確認
- [ ] tsconfig.json の設定差異をチェック
- [ ] 型定義ファイルの不整合を確認

### Jest Mock エラー
- [ ] Mock の戻り値型が正しく推論されているか
- [ ] `mockResolvedValue` vs `Promise.resolve` の使い分け
- [ ] Jest configuration の TypeScript 設定

### 一般的な修正パターン
```typescript
// ❌ 問題のあるパターン
jest.fn().mockResolvedValue(value)

// ✅ 安全なパターン  
jest.fn(() => Promise.resolve(value))
```

## 📋 Linting エラー

### Biome/ESLint エラー
- [ ] ローカルでlint コマンドを実行
- [ ] biome.json の include/exclude 設定確認
- [ ] `any` 型の使用箇所をチェック
- [ ] Cognitive complexity の問題を確認

### 一般的な修正パターン
```typescript
// process.env アクセス
process.env.KEY_NAME  // ✅ Good
process.env['KEY_NAME']  // ❌ Biome error

// Non-null assertion
value?.property  // ✅ Safe
value!.property  // ❌ Biome warning
```

## 🗃️ データベース関連

### Migration エラー
- [ ] Prisma schema の整合性確認
- [ ] Migration ファイルの順序確認
- [ ] 環境変数の設定確認

### 接続エラー
- [ ] DATABASE_URL の正確性
- [ ] ネットワーク接続の確認
- [ ] PostgreSQL サービスの起動状態

## 🏗️ ビルドエラー

### 依存関係問題
- [ ] package.json の依存関係確認
- [ ] node_modules の同期状態
- [ ] Lock ファイルの整合性

### 環境変数問題
- [ ] .env.example と実際の設定の差異
- [ ] 必須環境変数の設定確認
- [ ] 型安全な環境変数の読み込み

## 🔄 段階的デバッグ戦略

### Phase 1: 基本的なチェック
1. ローカル環境での再現確認
2. 最新のmain ブランチとの差分確認
3. 依存関係の更新確認

### Phase 2: 環境差異の調査
1. CI と ローカルの Node.js バージョン確認
2. パッケージマネージャーの差異（npm vs bun）
3. TypeScript compiler の設定差異

### Phase 3: 詳細分析
1. 特定エラーメッセージでの検索
2. 関連する GitHub Issues の調査
3. 技術ドキュメントの参照

## 📝 問題解決後のアクション

### ナレッジの蓄積
- [ ] 新しいトラブルシューティングドキュメントを作成
- [ ] 解決プロセスを詳細に記録
- [ ] 再発防止策を文書化

### コードの改善
- [ ] 根本原因に対する恒久的な修正
- [ ] 類似箇所の予防的修正
- [ ] テストケースの追加

### チーム共有
- [ ] 学んだ教訓の共有
- [ ] ベストプラクティスの更新
- [ ] 開発ガイドラインの改善

## 🚨 緊急時の対応

### クリティカルなCI 障害
1. **即座に**: 問題のあるPR をドラフトに変更
2. **短期**: Hotfix ブランチで最小限の修正
3. **中期**: 根本原因の調査と恒久対策

### リリースブロッカー
1. **評価**: 影響範囲とリスクの評価
2. **判断**: リリース延期 vs Hotfix の判断
3. **対応**: 適切なエスカレーションパス

---

このチェックリストを活用して、効率的かつ体系的な問題解決を行ってください。