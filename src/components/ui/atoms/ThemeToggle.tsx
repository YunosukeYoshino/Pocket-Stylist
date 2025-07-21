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
    const sizeMap = {
      icon: { small: 4, medium: 5, large: 6 },
      default: { small: 3, medium: 4, large: 5 },
    }

    const mapKey = variant === 'icon' ? 'icon' : 'default'
    return sizeMap[mapKey][size]
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
      <Text size={getTextSize() as any}>{getButtonText()}</Text>
    </Button>
  )
}
