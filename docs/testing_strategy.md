# テスト戦略

## 概要

Pocket Stylist AIの包括的なテスト戦略とテスト実装計画について説明します。品質保証、自動化、継続的インテグレーションを通じて、信頼性の高いアプリケーションの開発を目指します。

## テストピラミッド

```
        /\
       /  \
      / E2E \     <- 少数の高価値テスト
     /______\
    /        \
   /Integration\ <- 中程度の数のテスト
  /__________\
 /            \
/  Unit Tests  \   <- 多数の高速テスト
/______________\
```

## 1. 単体テスト (Unit Tests)

### 1.1 カバレッジ目標

- **コードカバレッジ**: 85%以上
- **ブランチカバレッジ**: 80%以上
- **関数カバレッジ**: 90%以上

### 1.2 テスト対象

#### フロントエンド (React Native)

```javascript
// utils/styleHelper.test.ts
import { generateStyleRecommendation } from '../utils/styleHelper';

describe('StyleHelper', () => {
  test('should generate recommendation for casual style', () => {
    const userProfile = {
      bodyType: 'athletic',
      skinTone: 'warm',
      preferences: { style: 'casual' }
    };
    
    const recommendation = generateStyleRecommendation(userProfile);
    
    expect(recommendation.colors).toContain('navy');
    expect(recommendation.styles).toContain('relaxed');
  });
});

// components/GarmentCard.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { GarmentCard } from '../components/GarmentCard';

describe('GarmentCard', () => {
  const mockGarment = {
    id: '123',
    name: 'White Shirt',
    category: 'tops',
    imageUrl: 'https://example.com/shirt.jpg'
  };

  test('should render garment information', () => {
    const { getByText } = render(<GarmentCard garment={mockGarment} />);
    
    expect(getByText('White Shirt')).toBeTruthy();
  });

  test('should call onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <GarmentCard garment={mockGarment} onPress={onPress} />
    );
    
    fireEvent.press(getByTestId('garment-card'));
    expect(onPress).toHaveBeenCalledWith(mockGarment);
  });
});
```

#### バックエンド (Node.js/Express)

```javascript
// services/aiService.test.js
import { AIService } from '../services/aiService';
import { ClaudeAPI } from '../lib/claude';

jest.mock('../lib/claude');

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate outfit recommendation', async () => {
    const mockResponse = {
      recommendation: 'Navy blazer with white shirt',
      confidence: 0.85
    };
    
    ClaudeAPI.generateRecommendation.mockResolvedValue(mockResponse);
    
    const result = await AIService.generateOutfitRecommendation({
      garments: ['shirt1', 'pants1'],
      occasion: 'business'
    });
    
    expect(result.confidence).toBeGreaterThan(0.8);
  });
});

// controllers/userController.test.js
import request from 'supertest';
import app from '../app';
import { User } from '../models/User';

jest.mock('../models/User');

describe('User Controller', () => {
  test('POST /api/users should create user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User'
    };
    
    User.create.mockResolvedValue({ id: '123', ...userData });
    
    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);
    
    expect(response.body.email).toBe(userData.email);
  });
});
```

### 1.3 テスト設定

#### Jest設定 (jest.config.js)

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/**/*.stories.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 85,
      statements: 85
    }
  },
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

## 2. 統合テスト (Integration Tests)

### 2.1 API統合テスト

```javascript
// tests/integration/auth.test.js
import request from 'supertest';
import app from '../../src/app';
import { setupTestDB, cleanupTestDB } from '../helpers/database';

describe('Authentication Integration', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  test('should authenticate user with valid token', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', 'Bearer valid_test_token')
      .expect(200);
    
    expect(response.body.user).toBeDefined();
  });

  test('should reject invalid token', async () => {
    await request(app)
      .get('/api/user/profile')
      .set('Authorization', 'Bearer invalid_token')
      .expect(401);
  });
});
```

### 2.2 データベース統合テスト

```javascript
// tests/integration/database.test.js
import { User, Garment } from '../../src/models';
import { sequelize } from '../../src/database';

describe('Database Integration', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  test('should create user with garments', async () => {
    const user = await User.create({
      email: 'test@example.com',
      name: 'Test User'
    });

    const garment = await Garment.create({
      userId: user.id,
      name: 'Test Shirt',
      category: 'tops'
    });

    const userWithGarments = await User.findByPk(user.id, {
      include: [Garment]
    });

    expect(userWithGarments.Garments).toHaveLength(1);
    expect(userWithGarments.Garments[0].name).toBe('Test Shirt');
  });
});
```

### 2.3 外部サービス統合テスト

```javascript
// tests/integration/claude.test.js
import { ClaudeService } from '../../src/services/claude';

describe('Claude API Integration', () => {
  test('should get style recommendation', async () => {
    const prompt = 'Recommend outfit for business meeting';
    
    const response = await ClaudeService.getRecommendation(prompt);
    
    expect(response).toBeDefined();
    expect(response.confidence).toBeGreaterThan(0);
  }, 30000); // 30秒タイムアウト
});
```

## 3. E2Eテスト (End-to-End Tests)

### 3.1 Detox設定 (React Native)

```javascript
// .detoxrc.js
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  configurations: {
    'ios.sim.debug': {
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/PocketStylist.app',
      build: 'xcodebuild -workspace ios/PocketStylist.xcworkspace -scheme PocketStylist -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      type: 'ios.simulator',
      device: {
        type: 'iPhone 13'
      }
    },
    'android.emu.debug': {
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_3_API_30'
      }
    }
  }
};
```

### 3.2 E2Eテストシナリオ

```javascript
// e2e/userFlow.test.js
describe('User Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  test('should complete onboarding flow', async () => {
    // ログイン
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('submit-button')).tap();

    // プロファイル設定
    await waitFor(element(by.text('プロファイル設定')))
      .toBeVisible()
      .withTimeout(5000);
    
    await element(by.id('height-input')).typeText('170');
    await element(by.id('weight-input')).typeText('65');
    await element(by.id('save-profile')).tap();

    // ホーム画面到達確認
    await expect(element(by.text('ワードローブ')))
      .toBeVisible();
  });

  test('should add and view garment', async () => {
    // 衣服追加
    await element(by.id('add-garment-fab')).tap();
    await element(by.id('garment-name')).typeText('ホワイトシャツ');
    await element(by.id('category-selector')).tap();
    await element(by.text('トップス')).tap();
    await element(by.id('save-garment')).tap();

    // 衣服表示確認
    await expect(element(by.text('ホワイトシャツ')))
      .toBeVisible();
  });
});
```

## 4. パフォーマンステスト

### 4.1 負荷テスト (K6)

```javascript
// tests/performance/load.test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // ramp up
    { duration: '5m', target: 100 }, // stay at 100 users
    { duration: '2m', target: 200 }, // ramp up
    { duration: '5m', target: 200 }, // stay at 200 users
    { duration: '2m', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95%のリクエストが500ms以下
    http_req_failed: ['rate<0.1'],    // エラー率10%以下
  },
};

export default function () {
  const response = http.get('https://api.pocket-stylist.com/health');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

### 4.2 メモリ・CPU監視

```javascript
// tests/performance/memory.test.js
const pidusage = require('pidusage');

describe('Memory Usage Tests', () => {
  test('should not exceed memory limits', async () => {
    const stats = await pidusage(process.pid);
    
    expect(stats.memory).toBeLessThan(512 * 1024 * 1024); // 512MB
    expect(stats.cpu).toBeLessThan(80); // 80%以下
  });
});
```

## 5. テストデータ管理

### 5.1 ファクトリーパターン

```javascript
// tests/factories/userFactory.js
export const userFactory = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  name: 'Test User',
  preferences: {
    style: 'casual',
    colors: ['navy', 'white']
  },
  ...overrides
});

export const garmentFactory = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Test Garment',
  category: 'tops',
  color: 'white',
  ...overrides
});
```

### 5.2 テストデータクリーンアップ

```javascript
// tests/helpers/cleanup.js
export const cleanupTestData = async () => {
  await db.orderItems.deleteMany({});
  await db.orders.deleteMany({});
  await db.outfitItems.deleteMany({});
  await db.outfits.deleteMany({});
  await db.garments.deleteMany({});
  await db.bodyProfiles.deleteMany({});
  await db.users.deleteMany({});
};
```

## 6. CI/CDでのテスト自動化

### 6.1 GitHub Actions設定

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: bun install
      - run: bun run test:unit --coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: bun install
      - run: bun run test:integration

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: bun install
      - run: brew tap wix/brew
      - run: brew install applesimutils
      - run: bun run detox build
      - run: bun run detox test
```

## 7. テスト監視・レポート

### 7.1 カバレッジレポート

```javascript
// package.json
{
  "scripts": {
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

### 7.2 テスト結果通知

```javascript
// tests/reporters/slackReporter.js
class SlackReporter {
  onRunComplete(contexts, results) {
    const message = {
      text: `テスト結果: ${results.numPassedTests}/${results.numTotalTests} 成功`,
      attachments: [{
        color: results.success ? 'good' : 'danger',
        fields: [
          { title: 'Coverage', value: `${results.coverageMap.getCoverageSummary().lines.pct}%` }
        ]
      }]
    };
    
    this.sendToSlack(message);
  }
}
```

## 8. テスト品質管理

### 8.1 テストメトリクス

- **テスト実行時間**: 5分以内（CI環境）
- **フレイキーテスト率**: 1%以下
- **テスト保守コスト**: 開発時間の20%以下

### 8.2 コードレビューチェックリスト

- [ ] 新機能にテストが追加されている
- [ ] エッジケースがカバーされている
- [ ] モックが適切に使用されている
- [ ] テストが読みやすく保守しやすい
- [ ] テストが独立して実行可能

## 9. 継続的改善

### 9.1 テスト分析

```javascript
// scripts/analyzeTests.js
const testResults = require('./test-results.json');

const slowTests = testResults.testResults
  .filter(test => test.perfStats.runtime > 1000)
  .sort((a, b) => b.perfStats.runtime - a.perfStats.runtime);

console.log('遅いテスト Top 10:');
slowTests.slice(0, 10).forEach(test => {
  console.log(`${test.name}: ${test.perfStats.runtime}ms`);
});
```

### 9.2 テスト戦略の見直し

- 月次でテストメトリクスの分析
- 四半期でテスト戦略の見直し
- 新技術導入時のテスト手法の更新
- チーム内でのテストベストプラクティスの共有