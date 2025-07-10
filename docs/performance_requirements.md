# パフォーマンス要件

## 概要

Pocket Stylist AIのパフォーマンス要件と最適化戦略について定義します。優れたユーザー体験を提供するための具体的な数値目標と実装方針を示します。

## パフォーマンス目標

### 1. レスポンス時間要件

| 機能 | 目標時間 | 上限時間 | 測定条件 |
|------|----------|----------|----------|
| **アプリ起動** | < 2秒 | < 3秒 | コールドスタート、WiFi接続 |
| **ログイン** | < 1秒 | < 2秒 | Auth0認証完了まで |
| **ホーム画面表示** | < 0.5秒 | < 1秒 | データ読み込み完了まで |
| **衣服一覧表示** | < 1秒 | < 2秒 | 100件のデータ表示 |
| **AI推奨生成** | < 5秒 | < 10秒 | Claude API呼び出し完了 |
| **画像アップロード** | < 3秒 | < 5秒 | 5MB画像、4G回線 |
| **検索機能** | < 0.8秒 | < 1.5秒 | 全文検索結果表示 |
| **API呼び出し** | < 500ms | < 1秒 | 単純なCRUD操作 |

### 2. スループット要件

| 指標 | 目標値 | 測定条件 |
|------|--------|----------|
| **同時接続ユーザー数** | 1,000人 | ピーク時間帯 |
| **API リクエスト/秒** | 500 RPS | 平均負荷 |
| **API リクエスト/秒** | 2,000 RPS | ピーク負荷 |
| **データベース接続** | 100 並行接続 | PostgreSQL |
| **画像処理** | 50 画像/分 | AI分析含む |

### 3. リソース使用量

| リソース | 目標値 | 上限値 | 環境 |
|----------|--------|--------|------|
| **CPU使用率** | < 50% | < 80% | 本番サーバー |
| **メモリ使用量** | < 2GB | < 4GB | Node.js プロセス |
| **ディスク使用量** | < 80% | < 90% | データベースサーバー |
| **ネットワーク帯域** | < 100Mbps | < 500Mbps | ピーク時 |
| **Redis メモリ** | < 1GB | < 2GB | キャッシュ用途 |

## モバイルアプリ最適化

### 4. React Native パフォーマンス

#### 4.1 レンダリング最適化

```typescript
// components/GarmentList.tsx
import React, { memo, useMemo, useCallback } from 'react';
import { FlatList } from 'react-native';

const GarmentItem = memo(({ item, onPress }: GarmentItemProps) => {
  return (
    <TouchableOpacity onPress={() => onPress(item.id)}>
      <FastImage 
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );
});

export const GarmentList = ({ garments, onItemPress }: Props) => {
  const keyExtractor = useCallback((item: Garment) => item.id, []);
  
  const renderItem = useCallback(({ item }: { item: Garment }) => (
    <GarmentItem item={item} onPress={onItemPress} />
  ), [onItemPress]);
  
  return (
    <FlatList
      data={garments}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
    />
  );
};
```

#### 4.2 画像最適化

```typescript
// utils/imageOptimizer.ts
export class ImageOptimizer {
  static async compressImage(uri: string): Promise<string> {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        { resize: { width: 800 } }, // 最大幅800px
      ],
      {
        compress: 0.8, // 80%品質
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    
    return manipResult.uri;
  }
  
  static getCdnUrl(imageId: string, width: number, quality: number = 80): string {
    return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${imageId}/w=${width},q=${quality}`;
  }
}

// components/OptimizedImage.tsx
export const OptimizedImage = ({ imageId, width, height }: Props) => {
  const imageUrl = useMemo(
    () => ImageOptimizer.getCdnUrl(imageId, width * 2), // Retina対応
    [imageId, width]
  );
  
  return (
    <FastImage
      source={{ 
        uri: imageUrl,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable
      }}
      style={{ width, height }}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
};
```

### 5. 状態管理最適化

#### 5.1 Redux Toolkit Query

```typescript
// store/api/garmentApi.ts
export const garmentApi = createApi({
  reducerPath: 'garmentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/garments',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Garment'],
  endpoints: (builder) => ({
    getGarments: builder.query<Garment[], { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => 
        `?page=${page}&limit=${limit}`,
      providesTags: ['Garment'],
      // 5分間キャッシュ
      keepUnusedDataFor: 300,
    }),
    getGarment: builder.query<Garment, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Garment', id }],
    }),
  }),
});
```

#### 5.2 メモ化とバーチャライゼーション

```typescript
// hooks/useVirtualizedList.ts
export const useVirtualizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollOffset / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, scrollOffset, itemHeight, containerHeight]);
  
  return { visibleItems, setScrollOffset };
};
```

## バックエンド最適化

### 6. API パフォーマンス

#### 6.1 データベース最適化

```sql
-- インデックス戦略
CREATE INDEX CONCURRENTLY idx_garments_user_category 
ON garments(user_id, category) 
WHERE user_id IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_garments_search_trgm 
ON garments USING gin(name gin_trgm_ops, brand gin_trgm_ops);

-- パーティショニング（大量データ対応）
CREATE TABLE garments_2024 PARTITION OF garments
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- クエリ最適化
EXPLAIN (ANALYZE, BUFFERS) 
SELECT g.*, u.name as user_name 
FROM garments g 
JOIN users u ON g.user_id = u.id 
WHERE g.category = 'tops' 
AND g.created_at >= '2024-01-01'
ORDER BY g.created_at DESC 
LIMIT 20;
```

#### 6.2 キャッシュ戦略

```typescript
// services/cacheService.ts
export class CacheService {
  private redis: Redis;
  
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  // タグベースキャッシュ無効化
  async invalidateByTag(tag: string): Promise<void> {
    const keys = await this.redis.keys(`*:${tag}:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// controllers/garmentController.ts
export class GarmentController {
  async getGarments(req: Request, res: Response) {
    const cacheKey = `garments:${req.user.id}:${req.query.page}:${req.query.limit}`;
    
    // キャッシュ確認
    let garments = await cacheService.get(cacheKey);
    
    if (!garments) {
      // データベースから取得
      garments = await garmentService.getGarments({
        userId: req.user.id,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      });
      
      // 5分間キャッシュ
      await cacheService.set(cacheKey, garments, 300);
    }
    
    res.json({ success: true, data: garments });
  }
}
```

#### 6.3 データベース接続プール

```typescript
// database/pool.ts
import { Pool } from 'pg';

export const dbPool = new Pool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  
  // 接続プール設定
  min: 5,                    // 最小接続数
  max: 20,                   // 最大接続数
  idleTimeoutMillis: 30000,  // アイドルタイムアウト
  connectionTimeoutMillis: 5000,  // 接続タイムアウト
  
  // パフォーマンス設定
  statement_timeout: 30000,   // クエリタイムアウト
  query_timeout: 30000,
  
  // SSL設定
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
});

// 接続監視
dbPool.on('connect', (client) => {
  logger.info('Database client connected');
});

dbPool.on('error', (err) => {
  logger.error('Database connection error', { error: err.message });
});
```

### 7. AI処理最適化

#### 7.1 Claude API 最適化

```typescript
// services/aiService.ts
export class AIService {
  private rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
  
  async generateRecommendation(prompt: string): Promise<AIRecommendation> {
    // レート制限チェック
    await this.rateLimiter.acquire();
    
    // プロンプト最適化
    const optimizedPrompt = this.optimizePrompt(prompt);
    
    // キャッシュ確認
    const cacheKey = `ai:recommendation:${hashPrompt(optimizedPrompt)}`;
    const cached = await cacheService.get<AIRecommendation>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // タイムアウト付きAPI呼び出し
    const response = await Promise.race([
      this.callClaudeAPI(optimizedPrompt),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('AI request timeout')), 30000)
      )
    ]);
    
    // 1時間キャッシュ
    await cacheService.set(cacheKey, response, 3600);
    
    return response;
  }
  
  private optimizePrompt(prompt: string): string {
    // プロンプト長の制限
    if (prompt.length > 1000) {
      prompt = prompt.substring(0, 1000) + '...';
    }
    
    // 不要な文字の除去
    return prompt.trim().replace(/\s+/g, ' ');
  }
}
```

#### 7.2 バッチ処理

```typescript
// services/batchProcessor.ts
export class BatchProcessor {
  private queue: Array<{ id: string; data: any; resolve: Function; reject: Function }> = [];
  private processing = false;
  
  async addToQueue<T>(id: string, data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ id, data, resolve, reject });
      
      if (!this.processing) {
        this.processQueue();
      }
    });
  }
  
  private async processQueue() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      // バッチサイズ（5件ずつ処理）
      const batch = this.queue.splice(0, 5);
      
      try {
        const results = await this.processBatch(batch);
        
        batch.forEach((item, index) => {
          item.resolve(results[index]);
        });
      } catch (error) {
        batch.forEach(item => {
          item.reject(error);
        });
      }
      
      // レート制限対応
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.processing = false;
  }
}
```

## CDN・静的アセット最適化

### 8. Cloudflare最適化

#### 8.1 画像配信最適化

```typescript
// utils/imageDelivery.ts
export class ImageDelivery {
  private static readonly ACCOUNT_HASH = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH;
  
  static getOptimizedUrl(
    imageId: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpeg';
      fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
    } = {}
  ): string {
    const {
      width,
      height,
      quality = 85,
      format = 'webp',
      fit = 'cover'
    } = options;
    
    let url = `https://imagedelivery.net/${this.ACCOUNT_HASH}/${imageId}`;
    
    const params: string[] = [];
    if (width) params.push(`w=${width}`);
    if (height) params.push(`h=${height}`);
    params.push(`q=${quality}`);
    params.push(`f=${format}`);
    params.push(`fit=${fit}`);
    
    return `${url}/${params.join(',')}`;
  }
  
  // レスポンシブ画像
  static getResponsiveUrls(imageId: string): ResponsiveImageUrls {
    return {
      small: this.getOptimizedUrl(imageId, { width: 320 }),
      medium: this.getOptimizedUrl(imageId, { width: 640 }),
      large: this.getOptimizedUrl(imageId, { width: 1280 }),
      xlarge: this.getOptimizedUrl(imageId, { width: 1920 }),
    };
  }
}
```

#### 8.2 キャッシュ設定

```typescript
// utils/cacheHeaders.ts
export const setCacheHeaders = (res: Response, type: 'static' | 'api' | 'dynamic') => {
  switch (type) {
    case 'static':
      // 静的アセット（1年間）
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      break;
    case 'api':
      // API レスポンス（5分間）
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
      break;
    case 'dynamic':
      // 動的コンテンツ（キャッシュなし）
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      break;
  }
};
```

## 監視・測定

### 9. パフォーマンス監視

#### 9.1 メトリクス収集

```typescript
// monitoring/metrics.ts
import { createPrometheusMetrics } from 'prom-client';

export class PerformanceMetrics {
  private static httpRequestDuration = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
  });
  
  private static dbQueryDuration = new prometheus.Histogram({
    name: 'db_query_duration_seconds',
    help: 'Database query duration in seconds',
    labelNames: ['operation', 'table'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
  });
  
  static recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number
  ) {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);
  }
  
  static recordDbQuery(operation: string, table: string, duration: number) {
    this.dbQueryDuration
      .labels(operation, table)
      .observe(duration);
  }
}
```

#### 9.2 フロントエンド監視

```typescript
// utils/performanceMonitor.ts
export class PerformanceMonitor {
  static measureRenderTime(componentName: string) {
    return function<T extends React.ComponentType<any>>(Component: T): T {
      return React.forwardRef((props, ref) => {
        const startTime = performance.now();
        
        useEffect(() => {
          const endTime = performance.now();
          const renderTime = endTime - startTime;
          
          // 100ms以上の場合は警告
          if (renderTime > 100) {
            logger.warn('Slow component render', {
              component: componentName,
              renderTime: `${renderTime.toFixed(2)}ms`
            });
          }
          
          // アナリティクスに送信
          analytics.track('Component Render Time', {
            component: componentName,
            renderTime
          });
        });
        
        return <Component {...props} ref={ref} />;
      }) as T;
    };
  }
  
  static measureApiCall(apiName: string) {
    return async function<T>(apiCall: () => Promise<T>): Promise<T> {
      const startTime = performance.now();
      
      try {
        const result = await apiCall();
        const duration = performance.now() - startTime;
        
        analytics.track('API Call Performance', {
          api: apiName,
          duration,
          success: true
        });
        
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        analytics.track('API Call Performance', {
          api: apiName,
          duration,
          success: false,
          error: error.message
        });
        
        throw error;
      }
    };
  }
}
```

### 10. 負荷テスト

#### 10.1 K6負荷テストシナリオ

```javascript
// tests/load/api-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export let options = {
  stages: [
    { duration: '5m', target: 100 },   // ウォームアップ
    { duration: '10m', target: 500 },  // 通常負荷
    { duration: '5m', target: 1000 },  // ピーク負荷
    { duration: '10m', target: 500 },  // 安定化
    { duration: '5m', target: 0 },     // クールダウン
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95%が1秒以下
    http_req_failed: ['rate<0.1'],      // エラー率10%以下
    errors: ['rate<0.1'],
  },
};

export default function () {
  const response = http.get('https://api.pocket-stylist.com/v1/garments', {
    headers: {
      'Authorization': 'Bearer ' + __ENV.TEST_TOKEN,
    },
  });
  
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
    'has data': (r) => JSON.parse(r.body).data.length > 0,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  
  sleep(1);
}
```

### 11. 継続的パフォーマンス改善

#### 11.1 パフォーマンス予算

```json
{
  "budgets": {
    "mobile": {
      "bundle_size": "500KB",
      "first_contentful_paint": "2s",
      "largest_contentful_paint": "3s",
      "time_to_interactive": "4s"
    },
    "desktop": {
      "bundle_size": "1MB",
      "first_contentful_paint": "1.5s",
      "largest_contentful_paint": "2s",
      "time_to_interactive": "3s"
    }
  },
  "api": {
    "response_time_p95": "500ms",
    "response_time_p99": "1s",
    "error_rate": "1%",
    "throughput": "1000 req/s"
  }
}
```

#### 11.2 パフォーマンス改善アクションプラン

1. **フェーズ1（即座に実装）**
   - 画像圧縮・WebP対応
   - API レスポンスのgzip圧縮
   - Redis キャッシュ導入

2. **フェーズ2（1ヶ月以内）**
   - データベースインデックス最適化
   - FlatList仮想化実装
   - CDN設定最適化

3. **フェーズ3（3ヶ月以内）**
   - Code splitting実装
   - Service Worker導入
   - データベースパーティショニング

4. **継続的改善**
   - 週次パフォーマンス分析
   - 月次最適化施策実装
   - 四半期パフォーマンス予算見直し