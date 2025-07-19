import * as AuthSession from 'expo-auth-session'
import * as Crypto from 'expo-crypto'
import * as SecureStore from 'expo-secure-store'
import Auth0, { type User as Auth0User } from 'react-native-auth0'
import type {
  AuthConfig,
  AuthError,
  LoginOptions,
  LogoutOptions,
  RefreshTokenResult,
  TokenSet,
  User,
} from '../../types/auth'

// 定数
const CUSTOM_CLAIMS_NAMESPACE = 'https://pocket-stylist.com/' as const
const DEFAULT_TOKEN_EXPIRY = 60 * 60 // 1 hour in seconds

// Auth0User をカスタムクレームで拡張
interface Auth0UserWithClaims extends Auth0User {
  'https://pocket-stylist.com/roles'?: string[]
  'https://pocket-stylist.com/permissions'?: string[]
  'https://pocket-stylist.com/app_metadata'?: User['app_metadata']
  'https://pocket-stylist.com/user_metadata'?: User['user_metadata']
}

class AuthService {
  private auth0: Auth0
  private config: AuthConfig

  constructor() {
    const domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN
    const clientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID
    const audience = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE

    if (!domain || !clientId || !audience) {
      throw new Error('Auth0 configuration is missing. Please check your environment variables.')
    }

    this.config = {
      domain,
      clientId,
      audience,
      scope: 'openid profile email offline_access',
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'pocket-stylist-ai',
        path: 'auth/callback',
      }),
      logoutUri: AuthSession.makeRedirectUri({
        scheme: 'pocket-stylist-ai',
        path: 'auth/logout',
      }),
      additionalParameters: {},
      customParameters: {
        prompt: 'login',
      },
    }

    this.auth0 = new Auth0({
      domain: this.config.domain,
      clientId: this.config.clientId,
    })
  }

  /**
   * ユーザーログイン処理
   */
  async login(options: LoginOptions = {}): Promise<TokenSet> {
    try {
      const loginOptions = {
        scope: options.scope || this.config.scope,
        audience: options.audience || this.config.audience,
        prompt: options.prompt || 'login',
        ...options,
      }

      const credentials = await this.auth0.webAuth.authorize({
        ...loginOptions,
        additionalParameters: this.config.additionalParameters,
      })

      if (!credentials.accessToken || !credentials.idToken) {
        throw new Error('Authentication failed: No valid tokens received')
      }

      // トークンをセキュアストレージに保存
      await this.storeTokens({
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken,
        id_token: credentials.idToken,
        token_type: credentials.tokenType || 'Bearer',
        expires_in: credentials.expiresIn || DEFAULT_TOKEN_EXPIRY,
        scope: credentials.scope,
      })

      return {
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken,
        id_token: credentials.idToken,
        token_type: credentials.tokenType || 'Bearer',
        expires_in: credentials.expiresIn || DEFAULT_TOKEN_EXPIRY,
        scope: credentials.scope,
      }
    } catch (error) {
      console.error('Login error:', error)
      throw this.handleAuthError(error)
    }
  }

  /**
   * ソーシャルログイン（Google, Apple, Facebook）
   */
  async loginWithSocial(connection: string): Promise<TokenSet> {
    try {
      const credentials = await this.auth0.webAuth.authorize({
        scope: this.config.scope,
        audience: this.config.audience,
        connection,
        additionalParameters: this.config.additionalParameters,
      })

      if (!credentials.accessToken || !credentials.idToken) {
        throw new Error('Social login failed: No valid tokens received')
      }

      await this.storeTokens({
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken,
        id_token: credentials.idToken,
        token_type: credentials.tokenType || 'Bearer',
        expires_in: credentials.expiresIn || DEFAULT_TOKEN_EXPIRY,
        scope: credentials.scope,
      })

      return {
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken,
        id_token: credentials.idToken,
        token_type: credentials.tokenType || 'Bearer',
        expires_in: credentials.expiresIn || DEFAULT_TOKEN_EXPIRY,
        scope: credentials.scope,
      }
    } catch (error) {
      console.error('Social login error:', error)
      throw this.handleAuthError(error)
    }
  }

  /**
   * ユーザーログアウト処理
   */
  async logout(options: LogoutOptions = {}): Promise<void> {
    try {
      // Auth0からログアウト
      await this.auth0.webAuth.clearSession({
        federated: options.federated !== false, // デフォルトでfederated logout
      })

      // ローカルストレージのトークンを削除
      await this.clearTokens()
    } catch (error) {
      console.error('Logout error:', error)
      // ログアウトエラーでもローカルトークンは削除
      await this.clearTokens()
      throw this.handleAuthError(error)
    }
  }

  /**
   * 現在のユーザー情報を取得
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const accessToken = await this.getStoredAccessToken()
      if (!accessToken) {
        return null
      }

      const userInfo = await this.auth0.auth.userInfo({
        token: accessToken,
      })

      return this.transformAuth0UserToUser(userInfo)
    } catch (error) {
      console.error('Get user error:', error)
      // トークンが無効な場合は null を返す
      const errorObj = error as { message?: string }
      if (errorObj.message?.includes('401') || errorObj.message?.includes('Unauthorized')) {
        await this.clearTokens()
        return null
      }
      throw this.handleAuthError(error)
    }
  }

  /**
   * アクセストークンのリフレッシュ
   */
  async refreshAccessToken(): Promise<RefreshTokenResult> {
    try {
      const refreshToken = await this.getStoredRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const credentials = await this.auth0.auth.refreshToken({
        refreshToken,
      })

      if (!credentials.accessToken || !credentials.idToken) {
        throw new Error('Token refresh failed: No valid tokens received')
      }

      // 新しいトークンを保存
      await this.storeTokens({
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken || refreshToken,
        id_token: credentials.idToken,
        token_type: credentials.tokenType || 'Bearer',
        expires_in: credentials.expiresIn || DEFAULT_TOKEN_EXPIRY,
      })

      return {
        accessToken: credentials.accessToken,
        idToken: credentials.idToken,
        expiresIn: credentials.expiresIn || DEFAULT_TOKEN_EXPIRY,
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      await this.clearTokens() // リフレッシュ失敗時はトークンをクリア
      throw this.handleAuthError(error)
    }
  }

  /**
   * 認証状態の確認
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await this.getStoredAccessToken()
      if (!accessToken) {
        return false
      }

      // トークンの有効性をチェック
      const user = await this.getCurrentUser()
      return user !== null
    } catch (error) {
      console.error('Authentication check error:', error)
      return false
    }
  }

  /**
   * パスワードリセット要求
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await this.auth0.auth.resetPassword({
        email,
        connection: 'Username-Password-Authentication',
      })
    } catch (error) {
      console.error('Password reset error:', error)
      throw this.handleAuthError(error)
    }
  }

  /**
   * トークンをセキュアストレージに保存
   */
  private async storeTokens(tokens: TokenSet): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync('access_token', tokens.access_token),
        SecureStore.setItemAsync('id_token', tokens.id_token),
        tokens.refresh_token && SecureStore.setItemAsync('refresh_token', tokens.refresh_token),
        SecureStore.setItemAsync(
          'token_expires_at',
          (Date.now() + tokens.expires_in * 1000).toString()
        ),
      ])
    } catch (error) {
      console.error('Token storage error:', error)
      throw new Error('Failed to store authentication tokens')
    }
  }

  /**
   * セキュアストレージからアクセストークンを取得
   */
  private async getStoredAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync('access_token')
      const expiresAt = await SecureStore.getItemAsync('token_expires_at')

      if (!token || !expiresAt) {
        return null
      }

      // トークンの有効期限チェック
      if (Date.now() >= Number.parseInt(expiresAt, 10)) {
        await this.clearTokens()
        return null
      }

      return token
    } catch (error) {
      console.error('Token retrieval error:', error)
      return null
    }
  }

  /**
   * セキュアストレージからリフレッシュトークンを取得
   */
  private async getStoredRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('refresh_token')
    } catch (error) {
      console.error('Refresh token retrieval error:', error)
      return null
    }
  }

  /**
   * ストレージからすべてのトークンを削除
   */
  private async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync('access_token'),
        SecureStore.deleteItemAsync('id_token'),
        SecureStore.deleteItemAsync('refresh_token'),
        SecureStore.deleteItemAsync('token_expires_at'),
      ])
    } catch (error) {
      console.error('Token clearing error:', error)
    }
  }

  /**
   * Auth0 User を アプリの User 型に変換
   */
  private transformAuth0UserToUser(auth0User: Auth0User): User {
    const userWithClaims = auth0User as Auth0UserWithClaims
    return {
      id: auth0User.sub || '',
      email: auth0User.email || '',
      name: auth0User.name,
      picture: auth0User.picture,
      nickname: auth0User.nickname,
      email_verified: auth0User.email_verified,
      sub: auth0User.sub || '',
      roles: userWithClaims['https://pocket-stylist.com/roles'] || ['user'],
      permissions: userWithClaims['https://pocket-stylist.com/permissions'] || [],
      app_metadata: userWithClaims['https://pocket-stylist.com/app_metadata'],
      user_metadata: userWithClaims['https://pocket-stylist.com/user_metadata'],
    }
  }

  /**
   * エラーハンドリング
   */
  private handleAuthError(error: unknown): AuthError {
    const errorObj = error as { message?: string; description?: string }
    if (errorObj.message?.includes('login_required')) {
      return {
        code: 'PS-AUTH-001',
        message: 'ログインが必要です',
        description: errorObj.description,
      }
    }

    if (errorObj.message?.includes('access_denied')) {
      return {
        code: 'PS-AUTH-002',
        message: 'アクセスが拒否されました',
        description: errorObj.description,
      }
    }

    if (errorObj.message?.includes('invalid_grant')) {
      return {
        code: 'PS-AUTH-003',
        message: '認証トークンが無効です',
        description: errorObj.description,
      }
    }

    return {
      code: 'PS-AUTH-000',
      message: errorObj.message || '認証エラーが発生しました',
      description: errorObj.description,
    }
  }


  /**
   * 現在の設定を取得
   */
  getConfig(): AuthConfig {
    return { ...this.config }
  }
}

// シングルトンインスタンス
export const authService = new AuthService()
export default authService
