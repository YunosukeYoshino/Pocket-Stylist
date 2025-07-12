import type React from 'react'
import { type ReactNode, createContext, useContext, useEffect } from 'react'
import { useAuth } from '../../stores/authStore'
import type { LoginOptions, LogoutOptions, User } from '../../types/auth'

// 定数
const TOKEN_REFRESH_INTERVAL_MS = 10 * 60 * 1000 // 10分

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  error: string | null
  login: (options?: LoginOptions) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithApple: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  logout: (options?: LogoutOptions) => Promise<void>
  getCurrentUser: () => Promise<void>
  refreshToken: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth()

  useEffect(() => {
    // アプリ起動時に認証状態を初期化
    auth.initialize()
  }, [auth.initialize])

  // トークンの自動リフレッシュ設定
  useEffect(() => {
    if (!auth.isAuthenticated) return

    // 定期的にトークンをチェックし、必要に応じてリフレッシュ
    const interval = setInterval(async () => {
      try {
        await auth.refreshToken()
      } catch (error) {
        console.error('Auto token refresh failed:', error)
        // リフレッシュに失敗した場合はログアウト状態になる（storeで処理済み）
      }
    }, TOKEN_REFRESH_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [auth.isAuthenticated, auth.refreshToken])

  const contextValue: AuthContextType = {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    error: auth.error,
    login: auth.login,
    loginWithGoogle: auth.loginWithGoogle,
    loginWithApple: auth.loginWithApple,
    loginWithFacebook: auth.loginWithFacebook,
    logout: auth.logout,
    getCurrentUser: auth.getCurrentUser,
    refreshToken: auth.refreshToken,
    requestPasswordReset: auth.requestPasswordReset,
    clearError: auth.clearError,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
