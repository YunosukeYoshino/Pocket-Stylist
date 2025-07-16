import * as SecureStore from 'expo-secure-store'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import authService from '../services/auth/authService'
import type {
  AuthError,
  AuthState,
  LoginOptions,
  LogoutOptions,
  MFAChallenge,
  User,
} from '../types/auth'

interface AuthActions {
  // ログイン・ログアウト
  login: (options?: LoginOptions) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithApple: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  logout: (options?: LogoutOptions) => Promise<void>

  // ユーザー情報管理
  getCurrentUser: () => Promise<void>
  refreshTokens: () => Promise<void>

  // 内部ヘルパー
  loginWithSocialProvider: (provider: 'google-oauth2' | 'apple' | 'facebook') => Promise<void>

  // 状態管理
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // 初期化
  initialize: () => Promise<void>

  // パスワードリセット
  requestPasswordReset: (email: string) => Promise<void>

  // MFA関連
  setupSMSMFA: (phoneNumber: string) => Promise<string>
  setupTOTPMFA: () => Promise<{ secret: string; qrCodeUrl: string; challengeId: string }>
  verifyMFASetup: (method: 'sms' | 'totp', code: string, challengeId: string) => Promise<void>
  verifyMFAChallenge: (challengeId: string, code: string) => Promise<void>
  resendMFACode: (challengeId: string) => Promise<void>
  getMFASettings: () => Promise<{ enabled: boolean; factors: Array<'sms' | 'totp' | 'push'> }>
  disableMFA: () => Promise<void>
  setMFAChallenge: (challenge: MFAChallenge | null) => void
  setMFARequired: (required: boolean) => void
}

type AuthStore = AuthState & AuthActions

// 高階関数で共通処理を抽象化
const createAsyncAuthAction =
  <T extends unknown[], R>(asyncFn: (...args: T) => Promise<R>) =>
  async (set: (state: Partial<AuthState>) => void, ...args: T): Promise<R> => {
    set({ isLoading: true, error: null })
    try {
      const result = await asyncFn(...args)
      set({ isLoading: false, error: null })
      return result
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('認証エラー')
      set({ isLoading: false, error: authError.message })
      throw error
    }
  }

// SecureStore アダプター（Zustandの永続化用）
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name)
    } catch (error) {
      console.error('SecureStore getItem error:', error)
      return null
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value)
    } catch (error) {
      console.error('SecureStore setItem error:', error)
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name)
    } catch (error) {
      console.error('SecureStore removeItem error:', error)
    }
  },
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      isAuthenticated: false,
      isLoading: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      idToken: null,
      error: null,
      mfaChallenge: null,
      mfaRequired: false,

      // ログイン処理
      login: async (options?: LoginOptions) => {
        set({ isLoading: true, error: null })
        try {
          const tokens = await authService.login(options)
          const user = await authService.getCurrentUser()

          set({
            isAuthenticated: true,
            user,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || null,
            idToken: tokens.id_token,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const authError = error as AuthError
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            isLoading: false,
            error: authError.message,
          })
          throw error
        }
      },

      // ソーシャルログイン共通処理
      loginWithSocialProvider: async (provider: 'google-oauth2' | 'apple' | 'facebook') => {
        set({ isLoading: true, error: null })
        try {
          const tokens = await authService.loginWithSocial(provider)
          const user = await authService.getCurrentUser()

          set({
            isAuthenticated: true,
            user,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || null,
            idToken: tokens.id_token,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const authError = error as AuthError
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            isLoading: false,
            error: authError.message,
          })
          throw error
        }
      },

      // Googleログイン
      loginWithGoogle: async () => {
        const { loginWithSocialProvider } = get()
        await loginWithSocialProvider('google-oauth2')
      },

      // Appleログイン
      loginWithApple: async () => {
        const { loginWithSocialProvider } = get()
        await loginWithSocialProvider('apple')
      },

      // Facebookログイン
      loginWithFacebook: async () => {
        const { loginWithSocialProvider } = get()
        await loginWithSocialProvider('facebook')
      },

      // ログアウト処理
      logout: async (options?: LogoutOptions) => {
        set({ isLoading: true, error: null })
        try {
          await authService.logout(options)
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const authError = error as AuthError
          // ログアウトエラーでも状態はクリア
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            isLoading: false,
            error: authError.message,
          })
        }
      },

      // 現在のユーザー情報を取得
      getCurrentUser: async () => {
        set({ isLoading: true, error: null })
        try {
          const user = await authService.getCurrentUser()
          set({
            user,
            isAuthenticated: user !== null,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const authError = error as AuthError
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: authError.message,
          })
        }
      },

      // トークンリフレッシュ
      refreshTokens: async () => {
        try {
          const refreshResult = await authService.refreshAccessToken()
          const user = await authService.getCurrentUser()

          set({
            user,
            accessToken: refreshResult.accessToken,
            idToken: refreshResult.idToken,
            isAuthenticated: true,
            error: null,
          })
        } catch (error) {
          const authError = error as AuthError
          // トークンリフレッシュ失敗時は認証状態をクリア
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            error: authError.message,
          })
        }
      },

      // ユーザー設定
      setUser: user => {
        set({ user, isAuthenticated: user !== null })
      },

      // ローディング状態設定
      setLoading: loading => {
        set({ isLoading: loading })
      },

      // エラー設定
      setError: error => {
        set({ error })
      },

      // エラークリア
      clearError: () => {
        set({ error: null })
      },

      // アプリ初期化時の認証状態復元
      initialize: async () => {
        set({ isLoading: true })
        try {
          const isAuthenticated = await authService.isAuthenticated()
          if (isAuthenticated) {
            const user = await authService.getCurrentUser()
            set({
              isAuthenticated: true,
              user,
              isLoading: false,
              error: null,
            })
          } else {
            set({
              isAuthenticated: false,
              user: null,
              accessToken: null,
              refreshToken: null,
              idToken: null,
              isLoading: false,
              error: null,
            })
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            isLoading: false,
            error: null,
          })
        }
      },

      // パスワードリセット要求
      requestPasswordReset: async email => {
        set({ isLoading: true, error: null })
        try {
          await authService.requestPasswordReset(email)
          set({ isLoading: false, error: null })
        } catch (error) {
          const authError = error as AuthError
          set({
            isLoading: false,
            error: authError.message,
          })
          throw error
        }
      },

      // MFA関連のアクション
      setupSMSMFA: async phoneNumber => {
        return await createAsyncAuthAction(authService.setupSMSMFA)(set, phoneNumber)
      },

      setupTOTPMFA: async () => {
        return await createAsyncAuthAction(authService.setupTOTPMFA)(set)
      },

      verifyMFASetup: async (method, code, challengeId) => {
        return await createAsyncAuthAction(authService.verifyMFASetup)(
          set,
          method,
          code,
          challengeId
        )
      },

      verifyMFAChallenge: async (challengeId, code) => {
        set({ isLoading: true, error: null })
        try {
          await authService.verifyMFAChallenge(challengeId, code)
          set({
            isLoading: false,
            error: null,
            mfaChallenge: null,
            mfaRequired: false,
          })
        } catch (error) {
          const authError = error instanceof Error ? error : new Error('認証エラー')
          set({
            isLoading: false,
            error: authError.message,
          })
          throw error
        }
      },

      resendMFACode: async challengeId => {
        return await createAsyncAuthAction(authService.resendMFACode)(set, challengeId)
      },

      getMFASettings: async () => {
        return await createAsyncAuthAction(authService.getMFASettings)(set)
      },

      disableMFA: async () => {
        return await createAsyncAuthAction(authService.disableMFA)(set)
      },

      setMFAChallenge: challenge => {
        set({ mfaChallenge: challenge })
      },

      setMFARequired: required => {
        set({ mfaRequired: required })
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => secureStorage),
      // セキュリティ上重要な情報は永続化しない
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// 認証状態を監視するフック
export const useAuth = () => {
  const {
    isAuthenticated,
    isLoading,
    user,
    error,
    mfaChallenge,
    mfaRequired,
    login,
    loginWithGoogle,
    loginWithApple,
    loginWithFacebook,
    logout,
    getCurrentUser,
    refreshTokens,
    setError,
    clearError,
    initialize,
    requestPasswordReset,
    setupSMSMFA,
    setupTOTPMFA,
    verifyMFASetup,
    verifyMFAChallenge,
    resendMFACode,
    getMFASettings,
    disableMFA,
    setMFAChallenge,
    setMFARequired,
  } = useAuthStore()

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    mfaChallenge,
    mfaRequired,
    login,
    loginWithGoogle,
    loginWithApple,
    loginWithFacebook,
    logout,
    getCurrentUser,
    refreshToken: refreshTokens,
    setError,
    clearError,
    initialize,
    requestPasswordReset,
    setupSMSMFA,
    setupTOTPMFA,
    verifyMFASetup,
    verifyMFAChallenge,
    resendMFACode,
    getMFASettings,
    disableMFA,
    setMFAChallenge,
    setMFARequired,
  }
}

export default useAuthStore
