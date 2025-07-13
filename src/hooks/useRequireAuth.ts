import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { useAuthContext } from '../components/auth/AuthProvider'
import type { User } from '../types/auth'

interface UseRequireAuthOptions {
  redirectTo?: string
  roles?: string[]
  permissions?: string[]
}

// ロール認証チェック
const hasRequiredRoles = (user: User | null, roles?: string[]): boolean => {
  if (!roles || roles.length === 0) return true
  if (!user) return false

  const userRoles = user.roles || []
  return roles.some(role => userRoles.includes(role))
}

// 権限認証チェック
const hasRequiredPermissions = (user: User | null, permissions?: string[]): boolean => {
  if (!permissions || permissions.length === 0) return true
  if (!user) return false

  const userPermissions = user.permissions || []
  return permissions.some(permission => userPermissions.includes(permission))
}

// 認証・認可チェック実行
const performAuthorizationCheck = (
  user: User | null,
  roles?: string[],
  permissions?: string[]
): boolean => {
  return hasRequiredRoles(user, roles) && hasRequiredPermissions(user, permissions)
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
