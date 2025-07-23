import { type GetProps, styled, Text } from '@tamagui/core'
import React from 'react'

const IconMap = {
  // Basic
  x: '✕',
  plus: '+',
  check: '✓',
  close: '✕',
  menu: '☰',
  more: '⋯',
  
  // Navigation
  'chevron-down': '⌄',
  'chevron-up': '⌃',
  'chevron-left': '‹',
  'chevron-right': '›',
  'arrow-up': '↑',
  'arrow-down': '↓',
  'arrow-left': '←',
  'arrow-right': '→',
  
  // Actions
  star: '★',
  heart: '♡',
  share: '⤴',
  edit: '✎',
  delete: '🗑',
  save: '💾',
  upload: '⤴',
  download: '⤵',
  filter: '⚖',
  sort: '⇅',
  
  // App
  user: '👤',
  settings: '⚙',
  home: '🏠',
  search: '🔍',
  bell: '🔔',
  camera: '📷',
  image: '🖼',
  
  // Communication
  mail: '✉',
  phone: '📞',
  
  // Security
  lock: '🔒',
  eye: '👁',
  'eye-off': '🙈',
  
  // Time & Location
  calendar: '📅',
  clock: '🕐',
  map: '🗺',
  
  // Content
  tag: '🏷',
  flag: '🚩',
  bookmark: '🔖',
} as const

export type IconName = keyof typeof IconMap

interface PSIconBaseProps {
  name: IconName
}

export const PSIcon = styled(({ name, ...props }: PSIconBaseProps & GetProps<typeof Text>) => {
  const iconSymbol = IconMap[name as keyof typeof IconMap]
  return <Text {...props}>{iconSymbol}</Text>
}, {
  name: 'PSIcon',
  size: '$4',
  color: '$color',
  
  variants: {
    size: {
      1: { size: '$1' },
      2: { size: '$2' },
      3: { size: '$3' },
      4: { size: '$4' },
      5: { size: '$5' },
      6: { size: '$6' },
      7: { size: '$7' },
      8: { size: '$8' },
      small: { size: '$3' },
      medium: { size: '$4' },
      large: { size: '$6' },
      xlarge: { size: '$8' },
    },
    color: {
      primary: { color: '$primary' },
      secondary: { color: '$colorPress' },
      success: { color: '$success' },
      warning: { color: '$warning' },
      error: { color: '$error' },
      info: { color: '$info' },
      muted: { color: '$placeholderColor' },
    },
    interactive: {
      true: {
        cursor: 'pointer',
        hoverStyle: {
          opacity: 0.8,
        },
        pressStyle: {
          opacity: 0.6,
        },
      },
    },
  } as const,
  
  defaultVariants: {
    size: 'medium',
  },
})

export type PSIconProps = GetProps<typeof PSIcon>