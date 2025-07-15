import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { useAuthContext } from '../components/auth/AuthProvider'
import type { User } from '../types/auth'

interface UseRequireAuthOptions {
  redirectTo?: string
  roles?: string[]
  permissions?: string[]
}

// 認証・認可チェック実行
const performAuthorizationCheck = (
  user: User | null,
  roles?: string[],
  permissions?: string[]
): boolean => {
  if (!user) return false

  const hasRoles = !roles || roles.length === 0 || roles.some(role => user.roles?.includes(role))
  const hasPermissions =
    !permissions ||
    permissions.length === 0 ||
    permissions.some(permission => user.permissions?.includes(permission))

  return hasRoles && hasPermissions
}

/**
 * 認証が必要なページで使用するフック
 * 未認証の場合は自動的にリダイレクトする
 */
export const useRequireAuth = (options: UseRequireAuthOptions = {}) => {
  const { isAuthenticated, isLoading, user } = useAuthContext()
  const router = useRouter()
  const { redirectTo = '/login', roles, permissions } = options

  useEffect(() => {
    // ローディング中は何もしない
    if (isLoading) return

    // 未認証の場合はリダイレクト
    if (!isAuthenticated) {
      router.replace(redirectTo)
      return
    }

    // 認証・認可チェック
    if (!performAuthorizationCheck(user, roles, permissions)) {
      router.replace('/unauthorized')
      return
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo, roles, permissions])

  return {
    isAuthenticated,
    isLoading,
    user,
  }
}

export default useRequireAuth
