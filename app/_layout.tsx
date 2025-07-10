import { Stack } from 'expo-router'
import { TamaguiProvider } from '@tamagui/core'
import { tamaguiConfig } from '../config/tamagui.config'

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      </Stack>
    </TamaguiProvider>
  )
}