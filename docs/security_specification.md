# セキュリティ仕様書

## 概要

Pocket Stylist AIのセキュリティ要件と実装ガイドラインを定義します。ユーザーデータの保護、システムの可用性確保、脅威への対応策を包括的に扱います。

## セキュリティ原則

### 1. 基本原則

1. **機密性 (Confidentiality)**: ユーザーの個人情報と機密データの保護
2. **完全性 (Integrity)**: データの正確性と改ざん防止
3. **可用性 (Availability)**: サービスの継続的な提供
4. **認証 (Authentication)**: ユーザーの身元確認
5. **認可 (Authorization)**: 適切なアクセス権限の管理
6. **監査 (Auditing)**: セキュリティイベントの記録と追跡

### 2. セキュリティレベル分類

| データ分類 | セキュリティレベル | 要求事項 |
|------------|-------------------|----------|
| **公開情報** | パブリック | 改ざん防止のみ |
| **一般ユーザーデータ** | 内部使用 | 暗号化、アクセス制御 |
| **個人識別情報** | 機密 | 強固な暗号化、監査ログ |
| **決済情報** | 極秘 | PCI DSS準拠、トークン化 |
| **システム認証情報** | 極秘 | ハードウェアセキュリティモジュール |

## 認証・認可

### 3. Auth0 セキュリティ設定

#### 3.1 認証フロー

```typescript
// services/authService.ts
export class AuthService {
  private auth0Client: Auth0Client;
  
  constructor() {
    this.auth0Client = new Auth0Client({
      domain: process.env.AUTH0_DOMAIN!,
      clientId: process.env.AUTH0_CLIENT_ID!,
      audience: process.env.AUTH0_AUDIENCE!,
      scope: 'openid profile email',
      
      // セキュリティ設定
      useRefreshTokens: true,
      cacheLocation: 'memory', // セキュリティ強化のためメモリキャッシュを使用
      
      // PKCE（推奨）
      usePKCE: true,
      
      // セッション監視
      checkSessionInterval: 300000, // 5分
    });
  }
  
  async login(): Promise<void> {
    await this.auth0Client.loginWithRedirect({
      prompt: 'login', // 強制再認証
      max_age: 3600,   // セッション有効期限1時間
    });
  }
  
  async logout(): Promise<void> {
    await this.auth0Client.logout({
      returnTo: window.location.origin,
      federated: true, // IdP側でもログアウト
    });
  }
}
```

#### 3.2 JWT トークン検証

```typescript
// middleware/authMiddleware.ts
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

// JWKSからキーを取得する関数
const getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'PS-AUTH-002',
          message: '認証トークンが提供されていません'
        }
      });
    }
    
    const token = authHeader.substring(7);
    
    // JWTの検証
    const decoded = await verifyJWT(token);
    
    // ユーザー情報の設定
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      roles: decoded['https://pocket-stylist.com/roles'] || ['user'],
    };
    
    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error.message,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    return res.status(401).json({
      success: false,
      error: {
        code: 'PS-AUTH-001',
        message: '認証トークンが無効です'
      }
    });
  }
};

async function verifyJWT(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: process.env.AUTH0_AUDIENCE,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
}
```

### 4. 権限ベースアクセス制御 (RBAC)

```typescript
// middleware/authorizationMiddleware.ts
export enum Role {
  USER = 'user',
  PREMIUM_USER = 'premium_user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export enum Permission {
  READ_OWN_DATA = 'read:own_data',
  WRITE_OWN_DATA = 'write:own_data',
  READ_ALL_DATA = 'read:all_data',
  MANAGE_USERS = 'manage:users',
  SYSTEM_ADMIN = 'system:admin',
}

const rolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [
    Permission.READ_OWN_DATA,
    Permission.WRITE_OWN_DATA,
  ],
  [Role.PREMIUM_USER]: [
    Permission.READ_OWN_DATA,
    Permission.WRITE_OWN_DATA,
    // 追加機能のアクセス権
  ],
  [Role.MODERATOR]: [
    Permission.READ_OWN_DATA,
    Permission.WRITE_OWN_DATA,
    Permission.READ_ALL_DATA,
  ],
  [Role.ADMIN]: [
    Permission.READ_OWN_DATA,
    Permission.WRITE_OWN_DATA,
    Permission.READ_ALL_DATA,
    Permission.MANAGE_USERS,
    Permission.SYSTEM_ADMIN,
  ],
};

export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles || [Role.USER];
    
    const hasPermission = userRoles.some(role => 
      rolePermissions[role as Role]?.includes(permission)
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PS-AUTH-004',
          message: 'この操作を実行する権限がありません'
        }
      });
    }
    
    next();
  };
};
```

## データ保護

### 5. 暗号化

#### 5.1 保存時暗号化

```typescript
// utils/encryption.ts
import crypto from 'crypto';

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  
  static encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.KEY, iv);
    cipher.setAAD(Buffer.from('pocket-stylist-aad'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }
  
  static decrypt(data: EncryptedData): string {
    const decipher = crypto.createDecipheriv(this.ALGORITHM, this.KEY, Buffer.from(data.iv, 'hex'));
    decipher.setAAD(Buffer.from('pocket-stylist-aad'));
    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
    
    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  // 個人識別情報の暗号化
  static encryptPII(data: string): string {
    const encrypted = this.encrypt(data);
    return `${encrypted.encrypted}:${encrypted.iv}:${encrypted.authTag}`;
  }
  
  static decryptPII(encryptedData: string): string {
    const [encrypted, iv, authTag] = encryptedData.split(':');
    return this.decrypt({ encrypted, iv, authTag });
  }
}
```

#### 5.2 データベース暗号化

```sql
-- PostgreSQLの暗号化拡張
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 機密データの暗号化カラム
ALTER TABLE users 
ADD COLUMN encrypted_phone TEXT,
ADD COLUMN encrypted_address TEXT;

-- 暗号化関数
CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(pgp_sym_encrypt(data, current_setting('app.encryption_key')), 'base64');
END;
$$ LANGUAGE plpgsql;

-- 復号化関数
CREATE OR REPLACE FUNCTION decrypt_pii(encrypted_data TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(decode(encrypted_data, 'base64'), current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql;
```

#### 5.3 通信時暗号化 (TLS)

```typescript
// server/httpsServer.ts
import https from 'https';
import fs from 'fs';

const httpsOptions = {
  key: fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH!),
  cert: fs.readFileSync(process.env.SSL_CERTIFICATE_PATH!),
  
  // TLS 1.3を使用
  secureProtocol: 'TLSv1_3_method',
  
  // 安全な暗号スイートのみ
  ciphers: [
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256',
  ].join(':'),
  
  // Perfect Forward Secrecyの確保
  honorCipherOrder: true,
};

const server = https.createServer(httpsOptions, app);
```

### 6. データプライバシー

#### 6.1 個人情報の匿名化

```typescript
// services/privacyService.ts
export class PrivacyService {
  // データの匿名化
  static anonymizeUser(user: User): AnonymizedUser {
    return {
      id: this.hashUserId(user.id),
      ageGroup: this.getAgeGroup(user.birthDate),
      location: this.getRegion(user.address),
      interests: user.preferences?.style ? [user.preferences.style] : [],
      // 個人を特定できない情報のみ
    };
  }
  
  // データの仮名化
  static pseudonymizeEmail(email: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(email + process.env.SALT_SECRET!);
    return hash.digest('hex');
  }
  
  // データ削除（GDPR準拠）
  static async deleteUserData(userId: string): Promise<void> {
    const transaction = await db.transaction();
    
    try {
      // 関連データの削除
      await db.orderItems.destroy({ where: { order: { userId } }, transaction });
      await db.orders.destroy({ where: { userId }, transaction });
      await db.outfitItems.destroy({ where: { outfit: { userId } }, transaction });
      await db.outfits.destroy({ where: { userId }, transaction });
      await db.garments.destroy({ where: { userId }, transaction });
      await db.bodyProfiles.destroy({ where: { userId }, transaction });
      
      // ユーザーデータの削除
      await db.users.destroy({ where: { id: userId }, transaction });
      
      // 監査ログ
      logger.info('User data deleted', {
        userId,
        timestamp: new Date().toISOString(),
        action: 'GDPR_DELETE_REQUEST',
      });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

## 入力値検証・サニタイゼーション

### 7. バリデーション

```typescript
// validators/inputValidator.ts
import Joi from 'joi';
import xss from 'xss';

export class InputValidator {
  // ユーザー登録のバリデーション
  static userRegistration = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .max(255)
      .required()
      .messages({
        'string.email': '有効なメールアドレスを入力してください',
        'any.required': 'メールアドレスは必須です',
      }),
    
    name: Joi.string()
      .min(1)
      .max(100)
      .pattern(/^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]+$/)
      .required()
      .messages({
        'string.pattern.base': '名前に無効な文字が含まれています',
      }),
    
    phone: Joi.string()
      .pattern(/^[0-9\-\+\(\)\s]+$/)
      .max(20)
      .optional(),
  });
  
  // SQLインジェクション対策
  static sanitizeInput(input: string): string {
    return xss(input, {
      whiteList: {}, // HTMLタグを全て除去
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script'],
    });
  }
  
  // ファイルアップロードのバリデーション
  static validateImageUpload(file: Express.Multer.File): ValidationResult {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: 'サポートされていないファイル形式です',
      };
    }
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'ファイルサイズが上限を超えています',
      };
    }
    
    // ファイルヘッダーの検証（MIME type spoofing対策）
    if (!this.verifyFileHeader(file.buffer, file.mimetype)) {
      return {
        valid: false,
        error: 'ファイルの形式が一致しません',
      };
    }
    
    return { valid: true };
  }
  
  private static verifyFileHeader(buffer: Buffer, mimetype: string): boolean {
    const headers = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/webp': [0x52, 0x49, 0x46, 0x46],
    };
    
    const expected = headers[mimetype as keyof typeof headers];
    if (!expected) return false;
    
    return expected.every((byte, index) => buffer[index] === byte);
  }
}
```

### 8. CSRFプロテクション

```typescript
// middleware/csrfProtection.ts
import csrf from 'csurf';

export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000, // 1時間
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
});

// フロントエンド側のCSRFトークン取得
export const getCsrfToken = async (): Promise<string> => {
  const response = await fetch('/api/csrf-token', {
    credentials: 'include',
  });
  const { csrfToken } = await response.json();
  return csrfToken;
};
```

## レート制限・DDoS対策

### 9. レート制限

```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

// 一般的なAPIエンドポイント
export const generalRateLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // リクエスト数
  message: {
    success: false,
    error: {
      code: 'PS-EXT-004',
      message: 'リクエスト制限に達しました。しばらく待ってから再度お試しください。',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ログイン試行の制限
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 5, // 5回まで
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      code: 'PS-AUTH-006',
      message: 'ログイン試行回数が上限に達しました。15分後に再度お試しください。',
    },
  },
});

// AI API呼び出しの制限
export const aiApiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 50, // 50回まで
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    error: {
      code: 'PS-AI-006',
      message: 'AI機能の利用制限に達しました。1時間後に再度お試しください。',
    },
  },
});
```

### 10. セキュリティヘッダー

```typescript
// middleware/securityHeaders.ts
import helmet from 'helmet';

export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://imagedelivery.net"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.pocket-stylist.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1年
    includeSubDomains: true,
    preload: true,
  },
  
  // X-Frame-Options
  frameguard: { action: 'deny' },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  
  // Permissions Policy
  permissionsPolicy: {
    features: {
      camera: ['self'],
      microphone: ['none'],
      geolocation: ['self'],
      payment: ['self'],
    },
  },
});
```

## 監査・ログ

### 11. セキュリティログ

```typescript
// services/auditLogger.ts
export class AuditLogger {
  static async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType: event.type,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
      outcome: event.outcome,
    };
    
    // 構造化ログとして出力
    logger.info('Security Event', logEntry);
    
    // 重要なイベントはSlackに通知
    if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
      await this.sendSecurityAlert(logEntry);
    }
    
    // セキュリティログDB に保存
    await db.auditLogs.create(logEntry);
  }
  
  // ログイン試行のログ
  static async logLoginAttempt(
    userId: string,
    ipAddress: string,
    success: boolean,
    reason?: string
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'LOGIN_ATTEMPT',
      severity: success ? 'LOW' : 'MEDIUM',
      userId,
      ipAddress,
      outcome: success ? 'SUCCESS' : 'FAILURE',
      details: { reason },
    });
  }
  
  // データアクセスのログ
  static async logDataAccess(
    userId: string,
    dataType: string,
    operation: string,
    ipAddress: string
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'DATA_ACCESS',
      severity: 'LOW',
      userId,
      ipAddress,
      outcome: 'SUCCESS',
      details: { dataType, operation },
    });
  }
}
```

### 12. 異常検知

```typescript
// services/anomalyDetection.ts
export class AnomalyDetection {
  // 異常なログインパターンの検知
  static async detectSuspiciousLogin(userId: string, ipAddress: string): Promise<boolean> {
    const recent = await db.auditLogs.findAll({
      where: {
        userId,
        eventType: 'LOGIN_ATTEMPT',
        timestamp: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24時間以内
        },
      },
    });
    
    // 異なるIPアドレスからの多数ログイン
    const uniqueIPs = new Set(recent.map(log => log.ipAddress));
    if (uniqueIPs.size > 5) {
      await this.alertSecurityTeam('MULTIPLE_IP_LOGIN', { userId, ips: Array.from(uniqueIPs) });
      return true;
    }
    
    // 地理的に離れた場所からの短時間ログイン
    const geoLocations = await Promise.all(
      Array.from(uniqueIPs).map(ip => this.getGeoLocation(ip))
    );
    
    if (this.detectImpossibleTravel(geoLocations, recent)) {
      await this.alertSecurityTeam('IMPOSSIBLE_TRAVEL', { userId, locations: geoLocations });
      return true;
    }
    
    return false;
  }
  
  // APIアクセスパターンの異常検知
  static async detectAbusePattern(userId: string): Promise<boolean> {
    const requests = await redis.get(`api_requests:${userId}`);
    const requestCount = parseInt(requests || '0');
    
    // 通常の10倍以上のリクエスト
    if (requestCount > 1000) {
      await this.alertSecurityTeam('API_ABUSE', { userId, requestCount });
      return true;
    }
    
    return false;
  }
}
```

## インシデント対応

### 13. セキュリティインシデント対応手順

#### 13.1 インシデント分類

| レベル | 定義 | 対応時間 | 対応者 |
|--------|------|----------|--------|
| **P0 - Critical** | データ漏洩、システム侵害 | 15分以内 | CTO、セキュリティチーム全員 |
| **P1 - High** | 認証迂回、権限昇格 | 1時間以内 | セキュリティチーム |
| **P2 - Medium** | DDoS攻撃、不正アクセス試行 | 4時間以内 | オンコールエンジニア |
| **P3 - Low** | 軽微な脆弱性、設定ミス | 24時間以内 | 担当開発者 |

#### 13.2 対応フロー

```typescript
// services/incidentResponse.ts
export class IncidentResponse {
  static async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
    // 1. インシデントの記録
    const incidentId = await this.createIncident(incident);
    
    // 2. 重要度に応じた通知
    await this.notifyStakeholders(incident);
    
    // 3. 緊急対応の実行
    if (incident.severity === 'CRITICAL') {
      await this.executeCriticalResponse(incidentId);
    }
    
    // 4. 調査の開始
    await this.startInvestigation(incidentId);
    
    // 5. ステークホルダーへの報告
    await this.sendIncidentReport(incidentId);
  }
  
  private static async executeCriticalResponse(incidentId: string): Promise<void> {
    // 影響を受けるユーザーのセッション無効化
    await this.revokeAllSessions();
    
    // 疑わしいIPアドレスのブロック
    await this.blockSuspiciousIPs();
    
    // データベースアクセスの一時停止（必要に応じて）
    await this.enableReadOnlyMode();
    
    // 法執行機関への連絡準備
    await this.prepareLegalNotification();
  }
}
```

## コンプライアンス

### 14. 法規制への対応

#### 14.1 GDPR (一般データ保護規則)

```typescript
// services/gdprCompliance.ts
export class GDPRCompliance {
  // データポータビリティの権利
  static async exportUserData(userId: string): Promise<UserDataExport> {
    const userData = await db.users.findByPk(userId, {
      include: [
        { model: db.garments },
        { model: db.outfits },
        { model: db.orders },
        { model: db.bodyProfiles },
      ],
    });
    
    return {
      personal_information: {
        name: userData.name,
        email: userData.email,
        created_at: userData.createdAt,
      },
      garments: userData.garments,
      outfits: userData.outfits,
      orders: userData.orders.map(order => ({
        ...order,
        // 決済情報は除外
        payment_method: '[REDACTED]',
      })),
      body_profile: userData.bodyProfile,
    };
  }
  
  // 忘れられる権利
  static async deleteUserData(userId: string): Promise<void> {
    // PrivacyService.deleteUserData を呼び出し
    await PrivacyService.deleteUserData(userId);
    
    // GDPR削除ログの記録
    await AuditLogger.logSecurityEvent({
      type: 'GDPR_DELETE_REQUEST',
      severity: 'MEDIUM',
      userId,
      outcome: 'SUCCESS',
      details: { regulation: 'GDPR Article 17' },
    });
  }
  
  // 同意管理
  static async updateConsent(userId: string, consents: ConsentSettings): Promise<void> {
    await db.userConsents.upsert({
      userId,
      marketing: consents.marketing,
      analytics: consents.analytics,
      personalization: consents.personalization,
      updatedAt: new Date(),
    });
  }
}
```

#### 14.2 PCI DSS (決済カード業界データセキュリティ基準)

```typescript
// services/paymentSecurity.ts
export class PaymentSecurity {
  // カード情報のトークン化
  static async tokenizeCardData(cardData: CardData): Promise<string> {
    // 実際の実装では、PCI DSS準拠の決済代行サービスを使用
    const response = await stripe.tokens.create({
      card: {
        number: cardData.number,
        exp_month: cardData.expMonth,
        exp_year: cardData.expYear,
        cvc: cardData.cvc,
      },
    });
    
    // カード情報は保存せず、トークンのみ返す
    return response.id;
  }
  
  // 決済処理のログ（PCI DSS要件）
  static async logPaymentTransaction(transaction: PaymentTransaction): Promise<void> {
    await AuditLogger.logSecurityEvent({
      type: 'PAYMENT_TRANSACTION',
      severity: 'MEDIUM',
      userId: transaction.userId,
      outcome: transaction.status,
      details: {
        amount: transaction.amount,
        currency: transaction.currency,
        // カード情報は記録しない
        last4: transaction.cardToken.slice(-4),
      },
    });
  }
}
```

## セキュリティテスト

### 15. 脆弱性スキャン

```typescript
// scripts/securityScan.ts
export class SecurityScanner {
  // 依存関係の脆弱性チェック
  static async runDependencyAudit(): Promise<VulnerabilityReport> {
    const { stdout } = await exec('npm audit --json');
    const auditResult = JSON.parse(stdout);
    
    const vulnerabilities = auditResult.vulnerabilities || {};
    const criticalVulns = Object.values(vulnerabilities)
      .filter((vuln: any) => vuln.severity === 'critical');
    
    if (criticalVulns.length > 0) {
      await this.alertSecurityTeam('CRITICAL_VULNERABILITIES', {
        count: criticalVulns.length,
        packages: criticalVulns.map((v: any) => v.name),
      });
    }
    
    return {
      total: Object.keys(vulnerabilities).length,
      critical: criticalVulns.length,
      high: Object.values(vulnerabilities)
        .filter((vuln: any) => vuln.severity === 'high').length,
    };
  }
  
  // セキュリティヘッダーのチェック
  static async checkSecurityHeaders(url: string): Promise<HeaderCheckResult> {
    const response = await fetch(url);
    const headers = response.headers;
    
    const requiredHeaders = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
      'content-security-policy',
    ];
    
    const missingHeaders = requiredHeaders.filter(
      header => !headers.get(header)
    );
    
    return {
      passed: missingHeaders.length === 0,
      missing: missingHeaders,
    };
  }
}
```

### 16. ペネトレーションテスト

```yaml
# .github/workflows/security-test.yml
name: Security Tests

on:
  schedule:
    - cron: '0 2 * * 1' # 毎週月曜日2時に実行
  workflow_dispatch:

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm audit --audit-level high
      
  docker-security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'pocket-stylist:latest'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run GitLeaks
        uses: zricethezav/gitleaks-action@master
```

## 継続的セキュリティ改善

### 17. セキュリティ監視ダッシュボード

```typescript
// monitoring/securityDashboard.ts
export class SecurityDashboard {
  static async getSecurityMetrics(): Promise<SecurityMetrics> {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [
      loginAttempts,
      failedLogins,
      suspiciousActivities,
      blockedIPs,
    ] = await Promise.all([
      db.auditLogs.count({
        where: { eventType: 'LOGIN_ATTEMPT', timestamp: { [Op.gte]: last24h } }
      }),
      db.auditLogs.count({
        where: { eventType: 'LOGIN_ATTEMPT', outcome: 'FAILURE', timestamp: { [Op.gte]: last24h } }
      }),
      db.auditLogs.count({
        where: { severity: { [Op.in]: ['HIGH', 'CRITICAL'] }, timestamp: { [Op.gte]: last24h } }
      }),
      redis.scard('blocked_ips'),
    ]);
    
    return {
      loginAttempts,
      failedLogins,
      loginSuccessRate: ((loginAttempts - failedLogins) / loginAttempts * 100).toFixed(2),
      suspiciousActivities,
      blockedIPs,
      securityScore: this.calculateSecurityScore({
        loginSuccessRate: (loginAttempts - failedLogins) / loginAttempts,
        suspiciousActivities,
        blockedIPs,
      }),
    };
  }
}
```

### 18. セキュリティ向上計画

#### 18.1 短期目標（3ヶ月以内）

- [ ] WAF (Web Application Firewall) の導入
- [ ] セキュリティヘッダーの完全実装
- [ ] 脆弱性スキャンの自動化
- [ ] インシデント対応手順の策定

#### 18.2 中期目標（6ヶ月以内）

- [ ] Zero Trust Architecture の実装
- [ ] マルチファクタ認証の強制化
- [ ] セキュリティ監視の高度化
- [ ] ペネトレーションテストの定期実施

#### 18.3 長期目標（1年以内）

- [ ] SOC 2 Type II 認証の取得
- [ ] セキュリティ運用センター(SOC)の構築
- [ ] AIベースの脅威検知システム導入
- [ ] ISO 27001 認証の検討