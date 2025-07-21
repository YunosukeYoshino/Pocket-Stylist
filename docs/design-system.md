# Pocket Stylist Design System

## 概要

Pocket Stylistアプリケーション用のTamaguiベースのデザインシステムです。一貫性のあるUI/UXを提供し、効率的な開発をサポートします。

## 技術スタック

- **UI Framework**: Tamagui v1.95+
- **Animation**: @tamagui/animations-react-native
- **Typography**: Inter Font Family
- **Theming**: Light/Dark Mode サポート

## ブランドカラー

### Primary Colors
- **Primary**: `#E14F5A` (Pocket Stylist Red)
- **Primary Light**: `#E67B82`
- **Primary Dark**: `#C43E48`

### Semantic Colors
- **Secondary**: `#F8F9FA`
- **Accent**: `#6C63FF`
- **Success**: `#28A745`
- **Warning**: `#FFC107`
- **Error**: `#DC3545`
- **Info**: `#17A2B8`

## デザイントークン

### Spacing System (8px Grid)
```typescript
const space = {
  0: 0,
  0.25: 2,
  0.5: 4,
  0.75: 6,
  1: 8,
  1.5: 12,
  2: 16,
  3: 24,
  4: 32,
  // ... 続く
}
```

### Typography Scale
- **Font Family**: Inter
- **Size Range**: 11px - 134px (Size 1-16)
- **Weight Range**: 300-900
- **Line Heights**: サイズに対応した最適な行間

### Border Radius
- **Small**: 4px (`$1`)
- **Medium**: 8px (`$2`)
- **Large**: 16px (`$4`)
- **Extra Large**: 24px (`$6`)

## コンポーネント階層

### Atoms (基本コンポーネント)
- **Button**: プライマリ、セカンダリ、アウトライン、ゴースト variants
- **Text**: h1-h6、body、caption、label variants
- **Input**: default、filled、outline、underline variants
- **ThemeToggle**: テーマ切り替え機能

### Layout (レイアウトコンポーネント)
- **Container**: アプリケーションコンテナ
- **Stack**: フレックスレイアウト
- **Card**: カードコンテナ

## Theme System

### Light Theme
- **Background**: `#FFFFFF`
- **Text Color**: `#212529`
- **Border Color**: `#DEE2E6`

### Dark Theme
- **Background**: `#121212`
- **Text Color**: `#FFFFFF`
- **Border Color**: `#424242`

## 使用方法

### 基本的な使用例

```typescript
import { Button, Text, Input, Container, Card } from '@/components/ui'

function MyComponent() {
  return (
    <Container>
      <Card>
        <Text variant="h2">Welcome to Pocket Stylist</Text>
        <Input placeholder="Enter your name" />
        <Button variant="primary" size="large">
          Get Started
        </Button>
      </Card>
    </Container>
  )
}
```

### テーマの使用

```typescript
import { ThemeToggle } from '@/components/ui'

function Header() {
  return (
    <Container>
      <ThemeToggle variant="full" size="medium" />
    </Container>
  )
}
```

## ファイル構造

```
src/components/ui/
├── atoms/
│   ├── Button.tsx
│   ├── Text.tsx
│   ├── Input.tsx
│   ├── ThemeToggle.tsx
│   └── index.ts
├── layout/
│   └── Container.tsx
└── index.ts

config/
└── tamagui.config.ts
```

## レスポンシブ対応

```typescript
// メディアクエリのブレークポイント
const media = {
  xs: { maxWidth: 660 },
  sm: { maxWidth: 800 },
  md: { maxWidth: 1020 },
  lg: { maxWidth: 1280 },
  xl: { maxWidth: 1420 },
  xxl: { maxWidth: 1600 },
}
```

## アクセシビリティ

- **カラーコントラスト**: WCAG 2.1 AA準拠
- **フォーカス状態**: キーボードナビゲーション対応
- **スクリーンリーダー**: 適切なARIAラベル
- **タッチターゲット**: 44px以上のタップ領域

## 今後の拡張予定

- [ ] アイコンシステム
- [ ] フォームバリデーション
- [ ] アニメーション効果の追加
- [ ] モーダル・オーバーレイコンポーネント
- [ ] ナビゲーションコンポーネント

## 開発者向けノート

### 新しいコンポーネントの追加

1. 適切な階層（atoms/molecules/organisms）に配置
2. Tamaguiのstyled APIを使用
3. variants システムを活用
4. TypeScript型定義を含める
5. 適切なデフォルト値を設定

### パフォーマンス考慮事項

- Tamaguiの最適化されたスタイリングシステムを活用
- 不要なre-renderを避けるためのmemo化
- テーマ変更時のスムーズなアニメーション