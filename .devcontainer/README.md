# DevContainer Configuration

このディレクトリには、VS Code Dev Containers用の設定ファイルが含まれています。

## 設定ファイル

### `devcontainer.json` (デフォルト)
完全なセキュリティ機能を含むDevContainer設定：
- **ファイアウォール**: 厳格なネットワーク制限付き
- **必要な権限**: `NET_ADMIN`, `NET_RAW` capabilities
- **用途**: セキュリティが重要な本番開発環境

### `devcontainer-simple.json` (シンプル版)
簡素化されたDevContainer設定：
- **ファイアウォール**: なし
- **必要な権限**: 基本権限のみ
- **用途**: ローカル開発、クイックスタート

## 使用方法

### デフォルト設定（セキュリティ強化版）
```bash
# 自動的に使用されます
code .
```

### シンプル設定への切り替え
```bash
# デフォルト設定をバックアップ
mv .devcontainer/devcontainer.json .devcontainer/devcontainer-secure.json

# シンプル設定を有効化
mv .devcontainer/devcontainer-simple.json .devcontainer/devcontainer.json

# DevContainerを再構築
```

## セキュリティ設定の詳細

### ファイアウォール機能
- GitHub API、npm registry、Anthropic APIへのアクセスのみ許可
- その他の外部通信をブロック
- DNS解決とローカルネットワーク通信は許可

### 権限の説明
- `NET_ADMIN`: iptablesルールの設定に必要
- `NET_RAW`: ネットワークパケットの直接操作に必要

## トラブルシューティング

### ファイアウォールが原因でパッケージインストールが失敗する場合
1. シンプル設定に切り替える
2. または、`init-firewall.sh`内の許可ドメインリストに必要なドメインを追加

### 権限エラーが発生する場合
Docker環境でprivileged modeが有効になっているか確認してください。