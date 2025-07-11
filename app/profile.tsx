import { Button, Text, View } from '@tamagui/core'
import { Link } from 'expo-router'

export default function ProfileScreen() {
  return (
    <View flex={1} alignItems="center" justifyContent="center" padding="$4">
      <Text fontSize="$6" fontWeight="bold" marginBottom="$4">
        Profile
      </Text>
      <Text fontSize="$4" textAlign="center" marginBottom="$6" color="$gray11">
        Configure your style preferences
      </Text>
      <Link href="/" asChild>
        <Button theme="outlined" size="$4">
          Back to Home
        </Button>
      </Link>
    </View>
  )
}
