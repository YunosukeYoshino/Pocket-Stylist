# Pocket Stylist AI

[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-FF6B35?style=for-the-badge&logo=anthropic&logoColor=white)](https://claude.ai/code)

## 概要

Pocket Stylist AIは、AIを活用してユーザーの理想的なスタイルを発見するインテリジェントなファッションコンパニオンアプリです。React NativeとTamaguiで構築され、高度な機械学習アルゴリズムと直感的なモバイルインターフェースを通じて、パーソナライズされたスタイリング提案を提供します。

## 目的

従来のファッションアドバイスは高価で時間がかかり、多くの場合パーソナライズされていません。Pocket Stylist AIは以下によってファッション専門知識を民主化します：

- 即座にパーソナライズされたスタイル提案を提供
- 服装選択の推測作業を排除
- ファッションアドバイスを誰にでもアクセス可能に
- 日常のスタイリング選択における決定疲れを軽減

## 仕組み

最先端のAI技術とユーザーフレンドリーなデザインを組み合わせています：

- **AI駆動の推奨**: Claude AIがユーザーの好みと体型を分析
- **バーチャル試着**: リアルタイムの衣服可視化とフィッティング
- **スマートワードローブ**: 既存の衣服から自動的なコーディネート生成
- **スタイル学習**: ユーザーフィードバックによる継続的改善

## 開発環境

### 必要な環境

- Node.js (v18以上)
- Bunパッケージマネージャー
- Expo CLI

### クイックスタート

```bash
# 依存関係のインストール
bun install

# 開発サーバーの起動
expo start

# iOS で実行
expo start --ios

# Android で実行
expo start --android
```

### 開発ツール

- **パッケージマネージャー**: Bun
- **型チェック**: tsc
- **リンティング・フォーマット**: Biome
- **Git フック**: Husky（コミット前にゼロエラーを強制）

## ライセンス

MIT License - 詳細はLICENSEファイルを参照してください。