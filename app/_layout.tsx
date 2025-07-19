import { TamaguiProvider } from '@tamagui/core'
import { Stack } from 'expo-router'
import { tamaguiConfig } from '../config/tamagui.config'
import { AuthProvider } from '../src/components/auth/AuthProvider'

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: 'Home' }} />
          <Stack.Screen name="profile" options={{ title: 'Profile' }} />
          <Stack.Screen name="login" options={{ title: 'Login' }} />
        </Stack>
      </AuthProvider>
    </TamaguiProvider>
  )
}
