import { Button } from '@tamagui/button'
import { Stack, Text, View } from '@tamagui/core'
import { StatusBar } from 'expo-status-bar'
import type React from 'react'
import { useState } from 'react'
import { ActivityIndicator, Alert } from 'react-native'
import { useAuthContext } from './AuthProvider'

export const LoginScreen: React.FC = () => {
  const {
    login,
    loginWithGoogle,
    loginWithApple,
    loginWithFacebook,
    isLoading,
    error,
    clearError,
  } = useAuthContext()
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleLogin = async () => {
    try {
      setLoadingProvider('email')
      clearError()
      await login()
    } catch (error: any) {
      Alert.alert('ログインエラー', error.message || 'ログインに失敗しました')
    } finally {
      setLoadingProvider(null)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoadingProvider('google')
      clearError()
      await loginWithGoogle()
    } catch (error: any) {
      Alert.alert('Googleログインエラー', error.message || 'Googleログインに失敗しました')
    } finally {
      setLoadingProvider(null)
    }
  }

  const handleAppleLogin = async () => {
    try {
      setLoadingProvider('apple')
      clearError()
      await loginWithApple()
    } catch (error: any) {
      Alert.alert('Appleログインエラー', error.message || 'Appleログインに失敗しました')
    } finally {
      setLoadingProvider(null)
    }
  }

  const handleFacebookLogin = async () => {
    try {
      setLoadingProvider('facebook')
      clearError()
      await loginWithFacebook()
    } catch (error: any) {
      Alert.alert('Facebookログインエラー', error.message || 'Facebookログインに失敗しました')
    } finally {
      setLoadingProvider(null)
    }
  }

  const isProviderLoading = (provider: string) => {
    return loadingProvider === provider
  }

  return (
    <View flex={1} backgroundColor="$background">
      <StatusBar style="auto" />

      {/* ヘッダー */}
      <View flex={1} justifyContent="center" alignItems="center" padding="$6">
        <Stack flexDirection="column" alignItems="center" gap="$6" maxWidth={350} width="100%">
          {/* ロゴ・タイトル */}
          <Stack flexDirection="column" alignItems="center" gap="$3">
            <Text fontSize="$10" fontWeight="bold" color="$gray12">
              Pocket Stylist AI
            </Text>
            <Text fontSize="$4" color="$gray11" textAlign="center">
              AIが提案する、あなただけのファッション
            </Text>
          </Stack>

          {/* エラーメッセージ */}
          {error && (
            <View
              backgroundColor="$red2"
              borderColor="$red7"
              borderWidth={1}
              borderRadius="$4"
              padding="$3"
              width="100%"
            >
              <Text color="$red11" fontSize="$3" textAlign="center">
                {error}
              </Text>
            </View>
          )}

          {/* ログインボタン群 */}
          <Stack flexDirection="column" gap="$4" width="100%">
            {/* メール・パスワードログイン */}
            <Button
              theme="active"
              size="$5"
              onPress={handleLogin}
              disabled={isLoading}
              width="100%"
              icon={isProviderLoading('email') ? <ActivityIndicator color="white" /> : undefined}
            >
              <Text color="$white1" fontWeight="600">
                {isProviderLoading('email') ? 'ログイン中...' : 'メールでログイン'}
              </Text>
            </Button>

            {/* 区切り線 */}
            <Stack flexDirection="row" alignItems="center" gap="$3" marginVertical="$2">
              <View flex={1} height={1} backgroundColor="$gray6" />
              <Text fontSize="$2" color="$gray10">
                または
              </Text>
              <View flex={1} height={1} backgroundColor="$gray6" />
            </Stack>

            {/* Googleログイン */}
            <Button
              backgroundColor="$white1"
              borderColor="$gray7"
              borderWidth={1}
              size="$5"
              onPress={handleGoogleLogin}
              disabled={isLoading}
              width="100%"
              icon={isProviderLoading('google') ? <ActivityIndicator color="black" /> : undefined}
            >
              <Text color="$gray12" fontWeight="600">
                {isProviderLoading('google') ? '接続中...' : 'Googleでログイン'}
              </Text>
            </Button>

            {/* Appleログイン */}
            <Button
              backgroundColor="$black"
              size="$5"
              onPress={handleAppleLogin}
              disabled={isLoading}
              width="100%"
              icon={isProviderLoading('apple') ? <ActivityIndicator color="white" /> : undefined}
            >
              <Text color="$white1" fontWeight="600">
                {isProviderLoading('apple') ? '接続中...' : 'Appleでログイン'}
              </Text>
            </Button>

            {/* Facebookログイン */}
            <Button
              backgroundColor="$blue10"
              size="$5"
              onPress={handleFacebookLogin}
              disabled={isLoading}
              width="100%"
              icon={isProviderLoading('facebook') ? <ActivityIndicator color="white" /> : undefined}
            >
              <Text color="$white1" fontWeight="600">
                {isProviderLoading('facebook') ? '接続中...' : 'Facebookでログイン'}
              </Text>
            </Button>
          </Stack>

          {/* 注意事項 */}
          <Text fontSize="$2" color="$gray10" textAlign="center" marginTop="$4">
            ログインすることで、利用規約とプライバシーポリシーに同意したものとします
          </Text>
        </Stack>
      </View>
    </View>
  )
}

export default LoginScreen
