import type React from 'react'
import { type ReactNode, createContext, useContext, useEffect } from 'react'
import { useAuth } from '../../stores/authStore'
import { AuthState } from '../../types/auth'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: any
  error: string | null
  login: (options?: any) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithApple: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  logout: (options?: any) => Promise<void>
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
  }, [])

  // トークンの自動リフレッシュ設定
  useEffect(() => {
    if (!auth.isAuthenticated) return

    // 定期的にトークンをチェックし、必要に応じてリフレッシュ
    const interval = setInterval(
      async () => {
        try {
          await auth.refreshToken()
        } catch (error) {
          console.error('Auto token refresh failed:', error)
          // リフレッシュに失敗した場合はログアウト状態になる（storeで処理済み）
        }
      },
      10 * 60 * 1000
    ) // 10分ごと

    return () => clearInterval(interval)
  }, [auth.isAuthenticated])

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
