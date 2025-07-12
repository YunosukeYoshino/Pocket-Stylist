import { Button } from '@tamagui/button'
import { Stack, Text, View } from '@tamagui/core'
import type React from 'react'
import type { ReactNode } from 'react'
import AuthLoadingScreen from './AuthLoadingScreen'
import { useAuthContext } from './AuthProvider'
import LoginScreen from './LoginScreen'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: string[]
  permissions?: string[]
  fallback?: ReactNode
  loadingComponent?: ReactNode
}

/**
 * 認証が必要なコンポーネントをラップするコンポーネント
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
  permissions,
  fallback,
  loadingComponent,
}) => {
  const { isAuthenticated, isLoading, user } = useAuthContext()

  // ローディング中
  if (isLoading) {
    return <>{loadingComponent || <AuthLoadingScreen />}</>
  }

  // 未認証の場合
  if (!isAuthenticated) {
    return <>{fallback || <LoginScreen />}</>
  }

  // ロール・権限チェック
  if (user) {
    // ロールチェック
    if (roles && roles.length > 0) {
      const userRoles = user.roles || []
      const hasRequiredRole = roles.some(role => userRoles.includes(role))
      if (!hasRequiredRole) {
        return (
          <UnauthorizedScreen
            message="このページにアクセスする権限がありません"
            requiredRoles={roles}
          />
        )
      }
    }

    // 権限チェック
    if (permissions && permissions.length > 0) {
      const userPermissions = user.permissions || []
      const hasRequiredPermission = permissions.some(permission =>
        userPermissions.includes(permission)
      )
      if (!hasRequiredPermission) {
        return (
          <UnauthorizedScreen
            message="この機能を使用する権限がありません"
            requiredPermissions={permissions}
          />
        )
      }
    }
  }

  // 認証・認可が通った場合
  return <>{children}</>
}

// 権限不足画面コンポーネント
const UnauthorizedScreen: React.FC<{
  message: string
  requiredRoles?: string[]
  requiredPermissions?: string[]
}> = ({ message, requiredRoles, requiredPermissions }) => {
  const { logout } = useAuthContext()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <View
      flex={1}
      alignItems="center"
      justifyContent="center"
      padding="$6"
      backgroundColor="$background"
    >
      <Stack flexDirection="column" alignItems="center" gap="$4" maxWidth={300}>
        <Text fontSize="$8" color="$red10">
          ⚠️
        </Text>
        <Text fontSize="$6" fontWeight="600" color="$gray12" textAlign="center">
          アクセス拒否
        </Text>
        <Text fontSize="$4" color="$gray11" textAlign="center">
          {message}
        </Text>

        {(requiredRoles || requiredPermissions) && (
          <View backgroundColor="$gray2" borderRadius="$4" padding="$3" width="100%">
            <Text fontSize="$3" color="$gray11" textAlign="center">
              必要な権限:
            </Text>
            {requiredRoles && (
              <Text fontSize="$2" color="$gray10" textAlign="center">
                ロール: {requiredRoles.join(', ')}
              </Text>
            )}
            {requiredPermissions && (
              <Text fontSize="$2" color="$gray10" textAlign="center">
                権限: {requiredPermissions.join(', ')}
              </Text>
            )}
          </View>
        )}

        <Button theme="red" size="$4" onPress={handleLogout} marginTop="$4">
          別のアカウントでログイン
        </Button>
      </Stack>
    </View>
  )
}

export default ProtectedRoute
