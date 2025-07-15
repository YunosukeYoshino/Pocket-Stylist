import { Button } from '@tamagui/button'
import { Stack, Text, View } from '@tamagui/core'
import { StatusBar } from 'expo-status-bar'
import type React from 'react'
import { useState } from 'react'
import { ActivityIndicator, Alert, TextInput } from 'react-native'
import type { AuthError } from '../../types/auth'
import { useAuthContext } from './AuthProvider'

interface MFASetupScreenProps {
  onComplete: () => void
  onCancel: () => void
}

export const MFASetupScreen: React.FC<MFASetupScreenProps> = ({ onComplete, onCancel }) => {
  const { user } = useAuthContext()
  const [selectedMethod, setSelectedMethod] = useState<'sms' | 'totp' | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'select' | 'setup' | 'verify'>('select')
  const [totpSecret, setTotpSecret] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  const handleMethodSelect = (method: 'sms' | 'totp') => {
    setSelectedMethod(method)
    setStep('setup')
  }

  const handleSMSSetup = async () => {
    if (!phoneNumber) {
      Alert.alert('エラー', '電話番号を入力してください')
      return
    }

    setIsLoading(true)
    try {
      // TODO: Auth0 MFA API を使用してSMSセットアップを実装
      // await authService.setupSMSMFA(phoneNumber)
      console.log('SMS MFA setup for:', phoneNumber)
      setStep('verify')
    } catch (error) {
      const authError = error as AuthError
      Alert.alert('セットアップエラー', authError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTOTPSetup = async () => {
    setIsLoading(true)
    try {
      // TODO: Auth0 MFA API を使用してTOTPセットアップを実装
      // const result = await authService.setupTOTPMFA()
      // setTotpSecret(result.secret)
      // setQrCodeUrl(result.qrCodeUrl)
      console.log('TOTP MFA setup initiated')
      setTotpSecret('EXAMPLE_SECRET_KEY')
      setQrCodeUrl('https://example.com/qr-code')
      setStep('verify')
    } catch (error) {
      const authError = error as AuthError
      Alert.alert('セットアップエラー', authError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async () => {
    if (!verificationCode) {
      Alert.alert('エラー', '認証コードを入力してください')
      return
    }

    setIsLoading(true)
    try {
      // TODO: Auth0 MFA API を使用して認証コードを検証
      // await authService.verifyMFASetup(selectedMethod, verificationCode)
      console.log('MFA verification for:', selectedMethod, verificationCode)
      Alert.alert('成功', 'MFAが正常に設定されました', [{ text: 'OK', onPress: onComplete }])
    } catch (error) {
      const authError = error as AuthError
      Alert.alert('認証エラー', authError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const renderMethodSelection = () => (
    <Stack flexDirection="column" gap="$4" width="100%">
      <Text fontSize="$6" fontWeight="600" color="$gray12" textAlign="center">
        多要素認証の設定
      </Text>
      <Text fontSize="$4" color="$gray11" textAlign="center">
        アカウントをより安全にするため、多要素認証を設定してください
      </Text>

      <Stack flexDirection="column" gap="$3" marginTop="$4">
        <Button
          backgroundColor="$white1"
          borderColor="$gray7"
          borderWidth={1}
          size="$5"
          onPress={() => handleMethodSelect('sms')}
          disabled={isLoading}
          width="100%"
        >
          <Stack flexDirection="row" alignItems="center" gap="$3">
            <Text fontSize="$6">📱</Text>
            <Stack flexDirection="column" alignItems="flex-start">
              <Text color="$gray12" fontWeight="600">
                SMS認証
              </Text>
              <Text color="$gray10" fontSize="$3">
                電話番号にコードを送信
              </Text>
            </Stack>
          </Stack>
        </Button>

        <Button
          backgroundColor="$white1"
          borderColor="$gray7"
          borderWidth={1}
          size="$5"
          onPress={() => handleMethodSelect('totp')}
          disabled={isLoading}
          width="100%"
        >
          <Stack flexDirection="row" alignItems="center" gap="$3">
            <Text fontSize="$6">🔑</Text>
            <Stack flexDirection="column" alignItems="flex-start">
              <Text color="$gray12" fontWeight="600">
                認証アプリ
              </Text>
              <Text color="$gray10" fontSize="$3">
                Google Authenticator等を使用
              </Text>
            </Stack>
          </Stack>
        </Button>
      </Stack>

      <Button backgroundColor="$gray6" size="$4" onPress={onCancel} marginTop="$4">
        <Text color="$gray11">後で設定する</Text>
      </Button>
    </Stack>
  )

  const renderSMSSetup = () => (
    <Stack flexDirection="column" gap="$4" width="100%">
      <Text fontSize="$6" fontWeight="600" color="$gray12" textAlign="center">
        SMS認証の設定
      </Text>
      <Text fontSize="$4" color="$gray11" textAlign="center">
        認証コードを受信する電話番号を入力してください
      </Text>

      <TextInput
        placeholder="電話番号 (例: +81-90-1234-5678)"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        autoFocus
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          marginVertical: 8,
        }}
      />

      <Button
        theme="active"
        size="$5"
        onPress={handleSMSSetup}
        disabled={isLoading || !phoneNumber}
        width="100%"
        icon={isLoading ? <ActivityIndicator color="white" /> : undefined}
      >
        <Text color="$white1" fontWeight="600">
          {isLoading ? '設定中...' : '認証コードを送信'}
        </Text>
      </Button>

      <Button
        backgroundColor="$gray6"
        size="$4"
        onPress={() => setStep('select')}
        disabled={isLoading}
      >
        <Text color="$gray11">戻る</Text>
      </Button>
    </Stack>
  )

  const renderTOTPSetup = () => (
    <Stack flexDirection="column" gap="$4" width="100%" alignItems="center">
      <Text fontSize="$6" fontWeight="600" color="$gray12" textAlign="center">
        認証アプリの設定
      </Text>
      <Text fontSize="$4" color="$gray11" textAlign="center">
        Google Authenticatorなどの認証アプリでQRコードをスキャンしてください
      </Text>

      {/* QRコードプレースホルダー */}
      <View
        width={200}
        height={200}
        backgroundColor="$gray3"
        borderRadius="$4"
        alignItems="center"
        justifyContent="center"
        marginVertical="$4"
      >
        <Text fontSize="$8">📱</Text>
        <Text fontSize="$3" color="$gray10" textAlign="center">
          QRコード
        </Text>
      </View>

      <View backgroundColor="$gray2" borderRadius="$4" padding="$3" width="100%">
        <Text fontSize="$2" color="$gray10" textAlign="center">
          手動設定用キー:
        </Text>
        <Text fontSize="$3" color="$gray11" textAlign="center" fontFamily="$mono">
          {totpSecret}
        </Text>
      </View>

      <Button
        theme="active"
        size="$5"
        onPress={handleTOTPSetup}
        disabled={isLoading}
        width="100%"
        icon={isLoading ? <ActivityIndicator color="white" /> : undefined}
      >
        <Text color="$white1" fontWeight="600">
          {isLoading ? '設定中...' : '次へ'}
        </Text>
      </Button>

      <Button
        backgroundColor="$gray6"
        size="$4"
        onPress={() => setStep('select')}
        disabled={isLoading}
      >
        <Text color="$gray11">戻る</Text>
      </Button>
    </Stack>
  )

  const renderVerification = () => (
    <Stack flexDirection="column" gap="$4" width="100%">
      <Text fontSize="$6" fontWeight="600" color="$gray12" textAlign="center">
        認証コードの確認
      </Text>
      <Text fontSize="$4" color="$gray11" textAlign="center">
        {selectedMethod === 'sms'
          ? `${phoneNumber}に送信された認証コードを入力してください`
          : '認証アプリで生成された6桁のコードを入力してください'}
      </Text>

      <TextInput
        placeholder="認証コード (6桁)"
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="numeric"
        maxLength={6}
        textAlign="center"
        autoFocus
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 12,
          fontSize: 18,
          fontFamily: 'monospace',
          marginVertical: 16,
        }}
      />

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

      <Button
        backgroundColor="$gray6"
        size="$4"
        onPress={() => setStep('setup')}
        disabled={isLoading}
      >
        <Text color="$gray11">戻る</Text>
      </Button>
    </Stack>
  )

  return (
    <View flex={1} backgroundColor="$background">
      <StatusBar style="auto" />

      <View flex={1} justifyContent="center" alignItems="center" padding="$6">
        <Stack flexDirection="column" alignItems="center" gap="$6" maxWidth={350} width="100%">
          {step === 'select' && renderMethodSelection()}
          {step === 'setup' && selectedMethod === 'sms' && renderSMSSetup()}
          {step === 'setup' && selectedMethod === 'totp' && renderTOTPSetup()}
          {step === 'verify' && renderVerification()}
        </Stack>
      </View>
    </View>
  )
}

export default MFASetupScreen
