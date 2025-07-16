import { Button } from '@tamagui/button'
import { Stack, Text, View, styled } from '@tamagui/core'
import { StatusBar } from 'expo-status-bar'
import type React from 'react'
import { useState } from 'react'
import { ActivityIndicator, Alert, TextInput } from 'react-native'
import type { AuthError, MFAChallenge } from '../../types/auth'

const StyledTextInput = styled(TextInput, {
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$4',
  padding: '$3',
  minHeight: 44,
})

interface MFAChallengeScreenProps {
  challenge: MFAChallenge
  onComplete: () => void
  onCancel: () => void
}

export const MFAChallengeScreen: React.FC<MFAChallengeScreenProps> = ({
  challenge,
  onComplete,
  onCancel,
}) => {
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const handleVerification = async () => {
    if (!verificationCode) {
      Alert.alert('エラー', '認証コードを入力してください')
      return
    }

    setIsLoading(true)
    try {
      // TODO: Auth0 MFA API を使用してチャレンジを検証
      // await authService.verifyMFAChallenge(challenge.challenge_id, verificationCode)
      console.log('MFA challenge verification:', challenge.challenge_id, verificationCode)
      onComplete()
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('認証エラーが発生しました')
      Alert.alert('認証エラー', authError.message || '認証に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (challenge.type !== 'sms') return

    setResendLoading(true)
    try {
      // TODO: Auth0 MFA API を使用してコードを再送信
      // await authService.resendMFACode(challenge.challenge_id)
      console.log('MFA code resent for challenge:', challenge.challenge_id)
      Alert.alert('成功', '認証コードを再送信しました')
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('再送信エラーが発生しました')
      Alert.alert('再送信エラー', authError.message || '再送信に失敗しました')
    } finally {
      setResendLoading(false)
    }
  }

  const getMFATypeLabel = () => {
    switch (challenge.type) {
      case 'sms':
        return 'SMS認証'
      case 'push':
        return 'プッシュ通知'
      case 'otp':
        return '認証アプリ'
      default:
        return '多要素認証'
    }
  }

  const getMFADescription = () => {
    switch (challenge.type) {
      case 'sms':
        return challenge.phone_number
          ? `${challenge.phone_number}に送信された認証コードを入力してください`
          : '登録済みの電話番号に送信された認証コードを入力してください'
      case 'push':
        return 'モバイルアプリからのプッシュ通知を確認してください'
      case 'otp':
        return '認証アプリで生成された6桁のコードを入力してください'
      default:
        return '多要素認証が必要です'
    }
  }

  const getMFAIcon = () => {
    switch (challenge.type) {
      case 'sms':
        return '📱'
      case 'push':
        return '🔔'
      case 'otp':
        return '🔑'
      default:
        return '🔒'
    }
  }

  const renderPushNotification = () => (
    <Stack flexDirection="column" gap="$4" width="100%" alignItems="center">
      <Text fontSize="$8">{getMFAIcon()}</Text>
      <Text fontSize="$6" fontWeight="600" color="$gray12" textAlign="center">
        {getMFATypeLabel()}
      </Text>
      <Text fontSize="$4" color="$gray11" textAlign="center">
        {getMFADescription()}
      </Text>

      <View
        backgroundColor="$blue2"
        borderColor="$blue7"
        borderWidth={1}
        borderRadius="$4"
        padding="$4"
        width="100%"
        marginVertical="$4"
      >
        <Text color="$blue11" fontSize="$3" textAlign="center">
          プッシュ通知を確認して、認証を完了してください
        </Text>
      </View>

      <ActivityIndicator size="large" color="$blue10" />
      <Text fontSize="$3" color="$gray10" textAlign="center">
        認証を待っています...
      </Text>

      <Button backgroundColor="$gray6" size="$4" onPress={onCancel} marginTop="$4">
        <Text color="$gray11">キャンセル</Text>
      </Button>
    </Stack>
  )

  const renderCodeInput = () => (
    <Stack flexDirection="column" gap="$4" width="100%">
      <Text fontSize="$8" textAlign="center">
        {getMFAIcon()}
      </Text>
      <Text fontSize="$6" fontWeight="600" color="$gray12" textAlign="center">
        {getMFATypeLabel()}
      </Text>
      <Text fontSize="$4" color="$gray11" textAlign="center">
        {getMFADescription()}
      </Text>

      <View marginVertical="$4">
        <StyledTextInput
          placeholder="認証コード (6桁)"
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="numeric"
          maxLength={6}
          textAlign="center"
          autoFocus
          style={{ fontSize: 18, fontFamily: 'monospace' }}
        />
      </View>

      <Button
        theme="active"
        size="$5"
        onPress={handleVerification}
        disabled={isLoading || verificationCode.length !== 6}
        width="100%"
        icon={isLoading ? <ActivityIndicator color="white" /> : undefined}
      >
        <Text color="$white1" fontWeight="600">
          {isLoading ? '認証中...' : '認証を完了'}
        </Text>
      </Button>

      {challenge.type === 'sms' && (
        <Button
          backgroundColor="$gray6"
          size="$4"
          onPress={handleResendCode}
          disabled={resendLoading}
          icon={resendLoading ? <ActivityIndicator color="$gray11" /> : undefined}
        >
          <Text color="$gray11">{resendLoading ? '再送信中...' : 'コードを再送信'}</Text>
        </Button>
      )}

      <Button backgroundColor="$gray6" size="$4" onPress={onCancel} marginTop="$2">
        <Text color="$gray11">キャンセル</Text>
      </Button>
    </Stack>
  )

  return (
    <View flex={1} backgroundColor="$background">
      <StatusBar style="auto" />

      <View flex={1} justifyContent="center" alignItems="center" padding="$6">
        <Stack flexDirection="column" alignItems="center" gap="$6" maxWidth={350} width="100%">
          {challenge.type === 'push' ? renderPushNotification() : renderCodeInput()}
        </Stack>
      </View>
    </View>
  )
}

export default MFAChallengeScreen
