import { useTheme } from '@tamagui/core'
import type React from 'react'
import { Button } from './Button'
import { Text } from './Text'

export interface ThemeToggleProps {
  variant?: 'icon' | 'text' | 'full'
  size?: 'small' | 'medium' | 'large'
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'icon', size = 'medium' }) => {
  const theme = useTheme()
  const isDark = String(theme.name) === 'dark'

  const toggleTheme = () => {
    // This will be implemented with proper theme context
    console.log('Toggle theme:', isDark ? 'light' : 'dark')
  }

  const getTextSize = () => {
    if (variant === 'icon') {
      return size === 'large' ? 6 : size === 'small' ? 4 : 5
    }
    return size === 'large' ? 5 : size === 'small' ? 3 : 4
  }

  const getButtonText = () => {
    if (variant === 'text') {
      return isDark ? 'Light' : 'Dark'
    }
    if (variant === 'full') {
      return isDark ? '☀️ Light Mode' : '🌙 Dark Mode'
    }
    return isDark ? '☀️' : '🌙'
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onPress={toggleTheme}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      accessibilityRole="button"
    >
      <Text size={getTextSize()}>{getButtonText()}</Text>
    </Button>
  )
}
