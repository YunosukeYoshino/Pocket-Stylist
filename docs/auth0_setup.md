# Auth0設定ガイド

## 概要

Pocket Stylist AIでのAuth0認証システムの設定手順とベストプラクティスについて説明します。

## 前提条件

- Auth0アカウント（無料プランで開始可能）
- 管理者権限
- アプリケーションの本番・ステージング・開発環境のURL

## Auth0セットアップ手順

### 1. アプリケーション作成

#### 1.1 新しいアプリケーションの作成

1. Auth0ダッシュボードにログイン
2. **Applications** → **Create Application**
3. アプリケーション名: `Pocket Stylist AI`
4. アプリケーションタイプ: **Single Page Application** を選択
5. **Create** をクリック

#### 1.2 基本設定

```
Name: Pocket Stylist AI - Production
Description: AI-powered fashion companion app
Application Type: Single Page Application
Token Endpoint Authentication Method: None
```

### 2. アプリケーション設定

#### 2.1 基本情報

```
Domain: your-domain.auth0.com
Client ID: [自動生成される]
Client Secret: [SPAでは使用しない]
```

#### 2.2 Application URIs

**開発環境:**
```
Allowed Callback URLs:
- http://localhost:3000/callback
- exp://localhost:19000/--/auth/callback
- pocket-stylist://auth/callback

Allowed Logout URLs:
- http://localhost:3000/logout
- exp://localhost:19000/--/auth/logout
- pocket-stylist://auth/logout

Allowed Web Origins:
- http://localhost:3000
- http://localhost:19000

Allowed Origins (CORS):
- http://localhost:3000
- http://localhost:19000
```

**本番環境:**
```
Allowed Callback URLs:
- https://pocket-stylist.com/callback
- https://app.pocket-stylist.com/callback
- pocket-stylist://auth/callback

Allowed Logout URLs:
- https://pocket-stylist.com/logout
- https://app.pocket-stylist.com/logout
- pocket-stylist://auth/logout

Allowed Web Origins:
- https://pocket-stylist.com
- https://app.pocket-stylist.com

Allowed Origins (CORS):
- https://pocket-stylist.com
- https://app.pocket-stylist.com
```

### 3. API設定

#### 3.1 新しいAPI作成

1. **APIs** → **Create API**
2. API設定:
   ```
   Name: Pocket Stylist API
   Identifier: https://api.pocket-stylist.com
   Signing Algorithm: RS256
   ```

#### 3.2 スコープ定義

```
read:profile - ユーザープロファイルの読み取り
write:profile - ユーザープロファイルの更新
read:garments - 衣服データの読み取り
write:garments - 衣服データの作成・更新
read:outfits - コーディネートの読み取り
write:outfits - コーディネートの作成・更新
read:tryons - 試着データの読み取り
write:tryons - 試着セッションの作成
read:orders - 注文履歴の読み取り
write:orders - 注文の作成
admin:all - 管理者権限
```

### 4. ユーザー管理設定

#### 4.1 Database Connection

1. **Authentication** → **Database**
2. **Create DB Connection**
3. 設定:
   ```
   Name: Username-Password-Authentication
   Database Type: Auth0 Database
   Requires Username: No (メールアドレスのみ)
   ```

#### 4.2 Social Connections

**Google:**
```
Client ID: [Google Cloud Consoleで取得]
Client Secret: [Google Cloud Consoleで取得]
Attributes:
- email (required)
- name
- picture
```

**Apple:**
```
Team ID: [Apple Developer Accountで取得]
App ID: [Apple Developer Accountで取得]
Key ID: [Apple Developer Accountで取得]
Private Key: [.p8ファイルの内容]
```

### 5. ユーザープロファイル設定

#### 5.1 Custom Claims

**Rules作成:**
```javascript
function addCustomClaims(user, context, callback) {
  const namespace = 'https://pocket-stylist.com/';
  
  context.idToken[namespace + 'user_id'] = user.user_id;
  context.idToken[namespace + 'email'] = user.email;
  context.idToken[namespace + 'name'] = user.name;
  context.idToken[namespace + 'picture'] = user.picture;
  
  // アプリ固有のメタデータ
  if (user.app_metadata) {
    context.idToken[namespace + 'role'] = user.app_metadata.role || 'user';
    context.idToken[namespace + 'subscription'] = user.app_metadata.subscription || 'free';
  }
  
  callback(null, user, context);
}
```

#### 5.2 User Metadata

**app_metadata例:**
```json
{
  "role": "user",
  "subscription": "premium",
  "onboarding_completed": true,
  "created_via": "mobile_app"
}
```

**user_metadata例:**
```json
{
  "preferences": {
    "language": "ja",
    "currency": "JPY",
    "notifications": {
      "email": true,
      "push": true
    }
  }
}
```

### 6. セキュリティ設定

#### 6.1 Advanced Settings

```
Grant Types:
- Authorization Code
- Refresh Token
- Implicit (モバイルアプリのみ)

Token Endpoint Authentication Method: None
OIDC Conformant: Enabled
```

#### 6.2 MFA (多要素認証)

```
MFA Status: Optional
Factors:
- SMS
- Push Notification (Guardian)
- Time-based One-time Password (TOTP)

Rule for MFA enforcement:
- 管理者ユーザーは必須
- 一般ユーザーは任意
```

### 7. 環境変数設定

#### 7.1 アプリケーション環境変数

```bash
# .env ファイル
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_AUDIENCE=https://api.pocket-stylist.com
AUTH0_CALLBACK_URL=pocket-stylist://auth/callback
AUTH0_LOGOUT_URL=pocket-stylist://auth/logout
```

#### 7.2 React Native Expo設定

```javascript
// expo-auth-session設定
import * as AuthSession from 'expo-auth-session';

const auth0Config = {
  domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN,
  clientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID,
  audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE,
  redirectUri: AuthSession.makeRedirectUri({
    scheme: 'pocket-stylist',
    path: 'auth/callback'
  }),
  logoutUri: AuthSession.makeRedirectUri({
    scheme: 'pocket-stylist',
    path: 'auth/logout'
  }),
  additionalParameters: {},
  customParameters: {
    prompt: 'login'
  }
};
```

### 8. トークン管理

#### 8.1 JWTトークン設定

```
Algorithm: RS256
Token Lifetime:
- Access Token: 24 hours
- Refresh Token: 30 days
- ID Token: 10 hours

Token Claims:
- iss: https://your-domain.auth0.com/
- aud: https://api.pocket-stylist.com
- exp: [expiration time]
- iat: [issued at]
- sub: [user ID]
```

#### 8.2 トークン検証

```javascript
// Backend API での JWT 検証
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}
```

### 9. 監視・ログ

#### 9.1 Auth0ログの監視

```
Monitor Events:
- Success Login (s)
- Failed Login (f)
- Success Logout (slo)
- Success API Operation (sapi)
- Failed API Operation (fapi)
- Token Exchange (ste)
```

#### 9.2 カスタムアナリティクス

```javascript
// ログイン成功時のカスタムイベント
function trackAuthSuccess(user) {
  analytics.track('Auth Success', {
    userId: user.sub,
    email: user.email,
    loginMethod: user['https://pocket-stylist.com/login_method'],
    timestamp: new Date().toISOString()
  });
}
```

### 10. トラブルシューティング

#### 10.1 よくある問題

**問題: Callback URL mismatch**
```
解決策:
1. Auth0ダッシュボードでCallback URLsを確認
2. アプリのredirectUriと完全に一致することを確認
3. 大文字小文字、末尾のスラッシュに注意
```

**問題: CORS エラー**
```
解決策:
1. Allowed Origins (CORS) に正しいURLを追加
2. プリフライトリクエストの許可
3. Credentialsの設定確認
```

**問題: Token has expired**
```
解決策:
1. Refresh Tokenを使用した自動更新の実装
2. Token Lifetimeの適切な設定
3. ユーザーへの再認証要求
```

#### 10.2 デバッグツール

```javascript
// Auth0デバッグ用のログ設定
const auth0 = new Auth0({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  debugging: process.env.NODE_ENV === 'development',
  logLevel: 'debug'
});
```

### 11. 本番環境デプロイ

#### 11.1 環境分離

```
開発環境: dev-pocket-stylist.auth0.com
ステージング環境: staging-pocket-stylist.auth0.com
本番環境: pocket-stylist.auth0.com
```

#### 11.2 デプロイチェックリスト

- [ ] 本番環境用のAuth0テナント作成
- [ ] SSL証明書の設定
- [ ] カスタムドメインの設定
- [ ] MFA設定の有効化
- [ ] ログ監視の設定
- [ ] バックアップ・復旧手順の確認
- [ ] セキュリティスキャンの実行
- [ ] パフォーマンステストの実行