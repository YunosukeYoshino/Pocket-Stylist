# Pocket Stylist AI ドキュメント

## 📚 ドキュメント一覧

### 🏠 プロジェクト概要
- **[README](./README.md)** - プロジェクト概要と開発環境セットアップ
- **[概要](./overview.md)** - サービス概要、ターゲットユーザー、ユースケース
- **[ロードマップ](./roadmap.md)** - 開発スケジュール、マイルストーン、リスク管理

### 🏗️ システム設計
- **[システムアーキテクチャ](./architecture.md)** - 技術スタック、システム構成、デプロイフロー
- **[データモデル](./data_models.md)** - データベース設計、ER図、テーブル仕様
- **[API リファレンス](./api_reference.md)** - REST API仕様、エンドポイント一覧

### 🎨 デザインシステム
- **[デザインシステム](./design_system.md)** - ブランドガイドライン、UIコンポーネント、カラーパレット

### 🤖 AI・自動化
- **[AI パイプライン](./ai_pipeline.md)** - CI/CD、AI自動化ワークフロー、デプロイプロセス

### 🔧 開発・運用
- **[データベースセットアップ](./database_setup.md)** - DB初期化、マイグレーション、運用手順
- **[Auth0設定](./auth0_setup.md)** - 認証システムの設定手順と管理方法
- **[テスト戦略](./testing_strategy.md)** - テスト計画、自動化、品質保証

### 📊 品質・パフォーマンス
- **[エラーハンドリング](./error_handling.md)** - エラー処理、ログ出力、監視システム
- **[パフォーマンス要件](./performance_requirements.md)** - パフォーマンス目標と最適化戦略

### 🔒 セキュリティ
- **[セキュリティ仕様](./security_specification.md)** - セキュリティ要件、脅威対策、コンプライアンス

## 🚀 クイックスタート

### 開発環境の準備

1. **必要な環境**
   - Node.js (v18以上)
   - Bun パッケージマネージャー
   - Docker & Docker Compose
   - PostgreSQL 15+

2. **プロジェクトセットアップ**
   ```bash
   # リポジトリをクローン
   git clone <repository-url>
   cd Pocket-Stylist
   
   # 環境変数の設定
   cp .env.example .env
   # .env ファイルを編集して実際の値を設定
   
   # 依存関係のインストール
   bun install
   
   # Dockerでデータベースを起動
   docker-compose up -d postgres redis
   
   # データベースマイグレーション実行
   bun run migrate
   
   # 開発サーバー起動
   bun run dev
   ```

3. **認証設定**
   - [Auth0設定ガイド](./auth0_setup.md) に従ってAuth0を設定
   - `.env` ファイルに認証情報を追加

### 主要な開発フロー

1. **機能開発**
   - [システムアーキテクチャ](./architecture.md) でシステム構成を理解
   - [データモデル](./data_models.md) でデータ構造を確認
   - [API リファレンス](./api_reference.md) でAPI仕様を確認

2. **テスト実行**
   ```bash
   # 単体テスト
   bun run test
   
   # 統合テスト
   bun run test:integration
   
   # E2Eテスト
   bun run test:e2e
   ```

3. **デプロイメント**
   - [AI パイプライン](./ai_pipeline.md) で自動デプロイフローを確認
   - GitHub Actionsによる自動化を活用

## 📖 学習パス

### 新規開発者向け

1. **概要理解** → [概要](./overview.md) + [README](./README.md)
2. **技術理解** → [システムアーキテクチャ](./architecture.md) + [データモデル](./data_models.md)
3. **開発環境** → [データベースセットアップ](./database_setup.md) + [Auth0設定](./auth0_setup.md)
4. **実装開始** → [API リファレンス](./api_reference.md) + [デザインシステム](./design_system.md)

### 品質保証・運用担当者向け

1. **テスト理解** → [テスト戦略](./testing_strategy.md)
2. **監視・障害対応** → [エラーハンドリング](./error_handling.md)
3. **パフォーマンス** → [パフォーマンス要件](./performance_requirements.md)
4. **セキュリティ** → [セキュリティ仕様](./security_specification.md)

### プロジェクトマネージャー向け

1. **プロジェクト概要** → [概要](./overview.md) + [ロードマップ](./roadmap.md)
2. **技術スタック** → [システムアーキテクチャ](./architecture.md)
3. **開発プロセス** → [AI パイプライン](./ai_pipeline.md) + [テスト戦略](./testing_strategy.md)

## 🔗 外部リンク

### 開発ツール・サービス
- [Expo Documentation](https://docs.expo.dev/)
- [Auth0 Documentation](https://auth0.com/docs)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Claude AI API](https://docs.anthropic.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### 参考資料
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [Node.js Security Checklist](https://nodejs.org/en/security/)
- [API Design Guidelines](https://github.com/microsoft/api-guidelines)

## 📝 ドキュメント更新ガイドライン

### 更新時のルール

1. **言語統一**: 新規ドキュメントは日本語で作成
2. **フォーマット統一**: Markdown記法に従い、見出し構造を統一
3. **リンク更新**: 関連ドキュメント間の内部リンクを適切に設定
4. **バージョン管理**: 重要な変更時はGitで変更履歴を残す

### ドキュメント品質チェック

- [ ] 読みやすい文章構成
- [ ] 技術的精度の確保
- [ ] 実装可能な具体的な内容
- [ ] 最新情報の反映
- [ ] 他ドキュメントとの整合性

## 📞 サポート・問い合わせ

### 開発関連
- **技術的質問**: 開発チームSlackチャンネル
- **バグ報告**: GitHub Issues
- **機能要望**: プロダクトマネージャーまで

### ドキュメント関連
- **内容の誤り**: GitHub Pull Request
- **追加要望**: ドキュメントIssue
- **翻訳・改善**: コントリビューション歓迎

---

*最終更新: 2025年7月10日*  
*次回更新予定: 機能追加・仕様変更時*