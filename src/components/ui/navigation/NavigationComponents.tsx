import { type GetProps, styled, Text } from '@tamagui/core'
import type React from 'react'
import { View, TouchableOpacity, SafeAreaView, Modal } from 'react-native'
import { PSIcon, type IconName } from '../atoms/Icon'

// PSHeader - Header component
interface PSHeaderProps extends GetProps<typeof View> {
  title?: string
  leftIcon?: IconName
  rightIcon?: IconName
  onLeftPress?: () => void
  onRightPress?: () => void
  centerComponent?: React.ReactNode
  transparent?: boolean
}

export const PSHeader = styled(SafeAreaView, {
  name: 'PSHeader',
  backgroundColor: '$background',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  paddingHorizontal: '$4',
  paddingVertical: '$3',

  variants: {
    transparent: {
      true: {
        backgroundColor: 'transparent',
        borderBottomWidth: 0,
      },
    },
    elevated: {
      true: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    },
  } as const,
})

export const PSHeaderContent = styled(View, {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 44,
})

export const PSHeaderComponent: React.FC<PSHeaderProps> = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  centerComponent,
  transparent,
  ...props
}) => {
  return (
    <PSHeader transparent={transparent} {...props}>
      <PSHeaderContent>
        <View style={{ width: 44, alignItems: 'flex-start' }}>
          {leftIcon && (
            <TouchableOpacity onPress={onLeftPress}>
              <PSIcon name={leftIcon} size="medium" />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flex: 1, alignItems: 'center' }}>
          {centerComponent || (
            title && (
              <Text variant="h6" numberOfLines={1}>
                {title}
              </Text>
            )
          )}
        </View>

        <View style={{ width: 44, alignItems: 'flex-end' }}>
          {rightIcon && (
            <TouchableOpacity onPress={onRightPress}>
              <PSIcon name={rightIcon} size="medium" />
            </TouchableOpacity>
          )}
        </View>
      </PSHeaderContent>
    </PSHeader>
  )
}

// PSTabBar - Tab bar component
interface TabItem {
  key: string
  label: string
  icon: IconName
}

interface PSTabBarProps {
  items: TabItem[]
  activeTab: string
  onTabPress: (key: string) => void
  showLabels?: boolean
}

export const PSTabBar = styled(SafeAreaView, {
  name: 'PSTabBar',
  backgroundColor: '$background',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  paddingHorizontal: '$2',
  paddingTop: '$2',
})

export const PSTabBarContent = styled(View, {
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  minHeight: 60,
})

export const PSTabItem = styled(TouchableOpacity, {
  name: 'PSTabItem',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: '$2',

  variants: {
    active: {
      true: {
        opacity: 1,
      },
      false: {
        opacity: 0.6,
      },
    },
  } as const,

  defaultVariants: {
    active: false,
  },
})

export const PSTabBarComponent: React.FC<PSTabBarProps> = ({
  items,
  activeTab,
  onTabPress,
  showLabels = true,
}) => {
  return (
    <PSTabBar>
      <PSTabBarContent>
        {items.map((item) => {
          const isActive = activeTab === item.key
          return (
            <PSTabItem
              key={item.key}
              active={isActive}
              onPress={() => onTabPress(item.key)}
            >
              <PSIcon
                name={item.icon}
                size="medium"
                color={isActive ? 'primary' : 'muted'}
              />
              {showLabels && (
                <Text
                  variant="caption"
                  color={isActive ? 'primary' : 'secondary'}
                  marginTop="$1"
                >
                  {item.label}
                </Text>
              )}
            </PSTabItem>
          )
        })}
      </PSTabBarContent>
    </PSTabBar>
  )
}

// PSBottomSheet - Bottom sheet modal component
interface PSBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxHeight?: number | string
  snapPoints?: string[]
}

export const PSBottomSheetModal = styled(View, {
  name: 'PSBottomSheet',
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '$background',
  borderTopLeftRadius: '$6',
  borderTopRightRadius: '$6',
  paddingTop: '$4',
  paddingHorizontal: '$4',
  paddingBottom: '$6',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.25,
  shadowRadius: 16,
  elevation: 10,

  variants: {
    maxHeight: {
      auto: { maxHeight: '80%' },
      half: { maxHeight: '50%' },
      full: { maxHeight: '100%' },
    },
  } as const,

  defaultVariants: {
    maxHeight: 'auto',
  },
})

export const PSBottomSheetHandle = styled(View, {
  width: 32,
  height: 4,
  backgroundColor: '$borderColor',
  borderRadius: '$1',
  alignSelf: 'center',
  marginBottom: '$4',
})

export const PSBottomSheetHeader = styled(View, {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '$4',
})

export const PSBottomSheetContent = styled(View, {
  flex: 1,
})

export const PSBottomSheetComponent: React.FC<PSBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = 'auto',
}) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e: any) => e.stopPropagation()}>
          <PSBottomSheetModal maxHeight={maxHeight}>
            <PSBottomSheetHandle />
            
            {title && (
              <PSBottomSheetHeader>
                <Text variant="h6">{title}</Text>
                <TouchableOpacity onPress={onClose}>
                  <PSIcon name="x" size="medium" />
                </TouchableOpacity>
              </PSBottomSheetHeader>
            )}

            <PSBottomSheetContent>
              {children}
            </PSBottomSheetContent>
          </PSBottomSheetModal>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

export type { PSHeaderProps, PSTabBarProps, PSBottomSheetProps, TabItem }