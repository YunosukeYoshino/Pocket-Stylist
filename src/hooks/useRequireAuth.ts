import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { useAuthContext } from '../components/auth/AuthProvider'

interface UseRequireAuthOptions {
  redirectTo?: string
  roles?: string[]
  permissions?: string[]
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

    // ロール・権限チェック
    if (user) {
      // ロールチェック
      if (roles && roles.length > 0) {
        const userRoles = user.roles || []
        const hasRequiredRole = roles.some(role => userRoles.includes(role))
        if (!hasRequiredRole) {
          router.replace('/unauthorized')
          return
        }
      }

      // 権限チェック
      if (permissions && permissions.length > 0) {
        const userPermissions = user.permissions || []
        const hasRequiredPermission = permissions.some(permission =>
          userPermissions.includes(permission)
        )
        if (!hasRequiredPermission) {
          router.replace('/unauthorized')
          return
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo, roles, permissions])

  return {
    isAuthenticated,
    isLoading,
    user,
  }
}

export default useRequireAuth
