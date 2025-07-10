import { View, Text, Button } from '@tamagui/core'
import { Link } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function HomeScreen() {
  return (
    <View flex={1} alignItems="center" justifyContent="center" padding="$4">
      <Text fontSize="$8" fontWeight="bold" marginBottom="$4">
        Pocket Stylist AI
      </Text>
      <Text fontSize="$4" textAlign="center" marginBottom="$6" color="$gray11">
        Your intelligent fashion companion
      </Text>
      <Link href="/profile" asChild>
        <Button theme="active" size="$5">
          Get Started
        </Button>
      </Link>
      <StatusBar style="auto" />
    </View>
  )
}