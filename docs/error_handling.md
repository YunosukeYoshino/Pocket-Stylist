# エラーハンドリング仕様

## 概要

Pocket Stylist AIにおける統一されたエラーハンドリングシステムの仕様と実装ガイドラインです。一貫性のあるエラー処理により、ユーザビリティとデバッグ効率の向上を目指します。

## エラー分類体系

### 1. エラーレベル

| レベル | 説明 | 対応方針 |
|--------|------|----------|
| **CRITICAL** | システム停止、データ損失の危険性 | 即座に運用チームに通知 |
| **ERROR** | 機能が動作しない、ユーザーに影響 | ログ記録、Slack通知 |
| **WARNING** | 想定外の状況、パフォーマンス低下 | ログ記録、監視ダッシュボード |
| **INFO** | 一般的な情報、デバッグ用 | ログ記録のみ |

### 2. エラーカテゴリ

```typescript
enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  EXTERNAL_API = 'EXTERNAL_API',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  FILE_UPLOAD = 'FILE_UPLOAD',
  AI_PROCESSING = 'AI_PROCESSING',
  PAYMENT = 'PAYMENT'
}
```

## エラーコード体系

### 3. エラーコード設計

```
PS-[カテゴリ]-[詳細コード]

例:
PS-AUTH-001: 認証トークンが無効
PS-VAL-002: 必須フィールドが不足
PS-AI-003: Claude APIの呼び出し失敗
```

### 4. 標準エラーコード一覧

#### 認証・認可エラー (AUTH)
```
PS-AUTH-001: 認証トークンが無効または期限切れ
PS-AUTH-002: 認証トークンが提供されていない
PS-AUTH-003: Auth0認証失敗
PS-AUTH-004: アクセス権限が不足
PS-AUTH-005: アカウントが無効化されている
```

#### バリデーションエラー (VAL)
```
PS-VAL-001: 必須フィールドが不足
PS-VAL-002: 無効なメールアドレス形式
PS-VAL-003: パスワードが条件を満たしていない
PS-VAL-004: ファイルサイズが上限を超過
PS-VAL-005: サポートされていないファイル形式
PS-VAL-006: 無効なUUID形式
PS-VAL-007: 数値が範囲外
```

#### データベースエラー (DB)
```
PS-DB-001: データベース接続失敗
PS-DB-002: レコードが見つからない
PS-DB-003: 一意制約違反
PS-DB-004: 外部キー制約違反
PS-DB-005: データベースタイムアウト
PS-DB-006: トランザクション競合
```

#### AI処理エラー (AI)
```
PS-AI-001: Claude API呼び出し失敗
PS-AI-002: AI分析タイムアウト
PS-AI-003: 信頼度スコア不足
PS-AI-004: 画像解析失敗
PS-AI-005: プロンプト生成エラー
```

#### 外部APIエラー (EXT)
```
PS-EXT-001: Cloudflare API呼び出し失敗
PS-EXT-002: 画像アップロード失敗
PS-EXT-003: 決済API呼び出し失敗
PS-EXT-004: レート制限に達した
PS-EXT-005: 外部サービス一時停止
```

## 統一エラーレスポンス形式

### 5. APIレスポンス形式

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // PS-XXX-XXX
    message: string;        // ユーザー向けメッセージ
    details?: string;       // 開発者向け詳細
    timestamp: string;      // ISO 8601形式
    requestId: string;      // リクエスト追跡用ID
    path?: string;          // エラーが発生したAPIパス
    validationErrors?: {    // バリデーションエラーの詳細
      field: string;
      message: string;
    }[];
  };
}
```

### 6. エラーレスポンス例

```json
{
  "success": false,
  "error": {
    "code": "PS-VAL-001",
    "message": "入力内容に不備があります",
    "details": "Required field 'name' is missing",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "req_123e4567-e89b-12d3-a456-426614174000",
    "path": "/api/v1/garments",
    "validationErrors": [
      {
        "field": "name",
        "message": "衣服名は必須です"
      },
      {
        "field": "category",
        "message": "カテゴリを選択してください"
      }
    ]
  }
}
```

## バックエンド実装

### 7. エラークラス定義

```typescript
// src/errors/BaseError.ts
export abstract class BaseError extends Error {
  abstract readonly code: string;
  abstract readonly level: ErrorLevel;
  abstract readonly category: ErrorCategory;
  abstract readonly httpStatus: number;
  
  public readonly timestamp: Date;
  public readonly requestId?: string;
  
  constructor(
    message: string,
    public readonly details?: string,
    requestId?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.requestId = requestId;
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      requestId: this.requestId,
      level: this.level,
      category: this.category
    };
  }
}

// src/errors/ValidationError.ts
export class ValidationError extends BaseError {
  readonly code = 'PS-VAL-001';
  readonly level = ErrorLevel.ERROR;
  readonly category = ErrorCategory.VALIDATION;
  readonly httpStatus = 400;
  
  constructor(
    message: string,
    public readonly validationErrors: ValidationErrorDetail[],
    details?: string,
    requestId?: string
  ) {
    super(message, details, requestId);
  }
}

// src/errors/AuthenticationError.ts
export class AuthenticationError extends BaseError {
  readonly code = 'PS-AUTH-001';
  readonly level = ErrorLevel.ERROR;
  readonly category = ErrorCategory.AUTHENTICATION;
  readonly httpStatus = 401;
}
```

### 8. エラーハンドリングミドルウェア

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../errors/BaseError';
import { logger } from '../utils/logger';
import { generateRequestId } from '../utils/requestId';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  
  // ベースエラーかどうかチェック
  if (error instanceof BaseError) {
    // ログ出力
    logger.log(error.level, error.message, {
      code: error.code,
      category: error.category,
      details: error.details,
      requestId,
      stack: error.stack,
      path: req.path,
      method: req.method,
      userAgent: req.headers['user-agent']
    });
    
    // レスポンス送信
    return res.status(error.httpStatus).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.details : undefined,
        timestamp: error.timestamp.toISOString(),
        requestId,
        path: req.path,
        ...(error instanceof ValidationError && {
          validationErrors: error.validationErrors
        })
      }
    });
  }
  
  // 予期しないエラー
  logger.error('Unexpected error', {
    error: error.message,
    stack: error.stack,
    requestId,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({
    success: false,
    error: {
      code: 'PS-SYS-001',
      message: 'システムエラーが発生しました',
      timestamp: new Date().toISOString(),
      requestId
    }
  });
};
```

### 9. エラー生成ヘルパー

```typescript
// src/utils/errorFactory.ts
export class ErrorFactory {
  static validation(
    message: string,
    validationErrors: ValidationErrorDetail[],
    requestId?: string
  ): ValidationError {
    return new ValidationError(message, validationErrors, undefined, requestId);
  }
  
  static authentication(
    message: string = '認証が必要です',
    requestId?: string
  ): AuthenticationError {
    return new AuthenticationError(message, undefined, requestId);
  }
  
  static notFound(
    resource: string,
    requestId?: string
  ): NotFoundError {
    return new NotFoundError(`${resource}が見つかりません`, undefined, requestId);
  }
  
  static aiProcessing(
    operation: string,
    details?: string,
    requestId?: string
  ): AIProcessingError {
    return new AIProcessingError(
      `AI処理でエラーが発生しました: ${operation}`,
      details,
      requestId
    );
  }
}
```

## フロントエンド実装

### 10. エラーハンドリングhooks

```typescript
// src/hooks/useErrorHandler.ts
import { useCallback } from 'react';
import { useToast } from './useToast';
import { logger } from '../utils/logger';

interface UseErrorHandlerResult {
  handleError: (error: any) => void;
  handleApiError: (error: ApiError) => void;
}

export const useErrorHandler = (): UseErrorHandlerResult => {
  const { showToast } = useToast();
  
  const handleError = useCallback((error: any) => {
    logger.error('Frontend error', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    showToast({
      type: 'error',
      message: 'エラーが発生しました。しばらく待ってから再度お試しください。'
    });
  }, [showToast]);
  
  const handleApiError = useCallback((error: ApiError) => {
    const { code, message, validationErrors } = error;
    
    // バリデーションエラーの場合
    if (code.startsWith('PS-VAL') && validationErrors) {
      validationErrors.forEach(({ field, message }) => {
        showToast({
          type: 'error',
          message: `${field}: ${message}`
        });
      });
      return;
    }
    
    // 認証エラーの場合
    if (code.startsWith('PS-AUTH')) {
      // ログアウト処理
      // navigate to login
      return;
    }
    
    // その他のエラー
    showToast({
      type: 'error',
      message: message || 'エラーが発生しました'
    });
  }, [showToast]);
  
  return { handleError, handleApiError };
};
```

### 11. API呼び出しラッパー

```typescript
// src/utils/apiClient.ts
class ApiClient {
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const requestId = generateRequestId();
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          ...options.headers
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(data.error, response.status, requestId);
      }
      
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // ネットワークエラー等
      throw new ApiError({
        code: 'PS-NET-001',
        message: 'ネットワークエラーが発生しました',
        requestId
      }, 0, requestId);
    }
  }
}

export class ApiError extends Error {
  constructor(
    public readonly errorData: ErrorResponse['error'],
    public readonly status: number,
    public readonly requestId: string
  ) {
    super(errorData.message);
    this.name = 'ApiError';
  }
  
  get code(): string {
    return this.errorData.code;
  }
  
  get validationErrors() {
    return this.errorData.validationErrors;
  }
}
```

### 12. グローバルエラーバウンダリ

```typescript
// src/components/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // エラーログ送信
    logger.error('React Error Boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
    
    // Sentryに送信
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false })}
        />
      );
    }
    
    return this.props.children;
  }
}
```

## ログ出力仕様

### 13. ログ構造化

```typescript
// src/utils/logger.ts
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private log(level: LogEntry['level'], message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata
    };
    
    // 開発環境ではコンソール出力
    if (process.env.NODE_ENV === 'development') {
      console[level](JSON.stringify(entry, null, 2));
    }
    
    // 本番環境では構造化ログ
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(entry);
    }
  }
  
  error(message: string, metadata?: Record<string, any>) {
    this.log('error', message, metadata);
  }
  
  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata);
  }
  
  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }
  
  debug(message: string, metadata?: Record<string, any>) {
    this.log('debug', message, metadata);
  }
}
```

## 監視・アラート

### 14. エラー監視設定

```typescript
// src/monitoring/errorMonitor.ts
export class ErrorMonitor {
  static init() {
    // Sentry初期化
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      beforeSend(event) {
        // 機密情報のマスキング
        if (event.request?.headers?.authorization) {
          event.request.headers.authorization = '[Filtered]';
        }
        return event;
      }
    });
    
    // カスタムエラー追跡
    this.setupCustomTracking();
  }
  
  static trackError(error: BaseError, context: Record<string, any> = {}) {
    Sentry.withScope(scope => {
      scope.setTag('errorCode', error.code);
      scope.setTag('errorCategory', error.category);
      scope.setLevel(this.mapLogLevelToSentryLevel(error.level));
      scope.setContext('error', context);
      
      Sentry.captureException(error);
    });
    
    // Slackアラート（クリティカルエラーの場合）
    if (error.level === ErrorLevel.CRITICAL) {
      this.sendSlackAlert(error, context);
    }
  }
}
```

### 15. アラート閾値設定

```yaml
# monitoring/alerts.yml
alerts:
  error_rate:
    threshold: 5% # 5分間のエラー率
    window: 5m
    channels: [slack, email]
  
  auth_failures:
    threshold: 10 # 1分間の認証失敗回数
    window: 1m
    channels: [slack]
  
  ai_processing_errors:
    threshold: 3 # 5分間のAI処理エラー
    window: 5m
    channels: [slack, pagerduty]
  
  database_errors:
    threshold: 1 # データベースエラーは即座に通知
    window: 1m
    channels: [slack, pagerduty, email]
```

## 運用・保守

### 16. エラー分析・改善プロセス

1. **週次エラーレビュー**
   - エラー率の分析
   - 頻発エラーの特定
   - 改善施策の検討

2. **月次エラー分析**
   - エラーパターンの傾向分析
   - ユーザビリティ向上施策
   - 監視ツールの設定見直し

3. **エラー対応フロー**
   ```
   エラー発生 → 即座にログ記録 → アラート送信 → 
   担当者確認 → 原因調査 → 修正対応 → 再発防止策
   ```

### 17. パフォーマンス指標

- **MTTR (Mean Time To Recovery)**: 平均復旧時間 < 30分
- **エラー率**: < 1%
- **監視カバレッジ**: 90%以上
- **アラート精度**: 95%以上（誤検知率 < 5%）