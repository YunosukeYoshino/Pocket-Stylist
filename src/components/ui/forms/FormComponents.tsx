import { type GetProps, styled, Text, useTheme } from '@tamagui/core'
import React from 'react'
import { View, TouchableOpacity, Switch as RNSwitch } from 'react-native'
import { Button } from '../atoms/Button'
import { Input } from '../atoms/Input'
import { PSIcon } from '../atoms/Icon'

// PSForm - Form container with validation support
export const PSForm = styled(View, {
  name: 'PSForm',
  gap: '$4',
  
  variants: {
    spacing: {
      compact: { gap: '$2' },
      comfortable: { gap: '$4' },
      spacious: { gap: '$6' },
    },
  } as const,

  defaultVariants: {
    spacing: 'comfortable',
  },
})

// PSSelect - Dropdown/Select component
interface PSSelectProps extends GetProps<typeof TouchableOpacity> {
  placeholder?: string
  value?: string
  options: Array<{ label: string; value: string }>
  onSelect: (value: string) => void
  disabled?: boolean
}

export const PSSelect = styled(TouchableOpacity, {
  name: 'PSSelect',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 1,
  borderRadius: '$3',
  paddingHorizontal: '$3',
  paddingVertical: '$3',
  minHeight: 44,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',

  variants: {
    state: {
      disabled: {
        opacity: 0.6,
        backgroundColor: '$backgroundPress',
      },
      error: {
        borderColor: '$error',
      },
      focused: {
        borderColor: '$primary',
        borderWidth: 2,
      },
    },
    size: {
      small: {
        minHeight: 36,
        paddingHorizontal: '$2.5',
        paddingVertical: '$2',
      },
      medium: {
        minHeight: 44,
        paddingHorizontal: '$3',
        paddingVertical: '$3',
      },
      large: {
        minHeight: 52,
        paddingHorizontal: '$4',
        paddingVertical: '$4',
      },
    },
  } as const,

  defaultVariants: {
    size: 'medium',
  },
})

export const PSSelectComponent: React.FC<PSSelectProps> = ({ 
  placeholder = 'Select an option',
  value,
  options,
  onSelect,
  disabled,
  ...props 
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const selectedOption = options.find(option => option.value === value)

  return (
    <View>
      <PSSelect
        state={disabled ? 'disabled' : undefined}
        onPress={() => !disabled && setIsOpen(!isOpen)}
        {...props}
      >
        <Text
          color={selectedOption ? '$color' : '$placeholderColor'}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <PSIcon name="chevron-down" size="small" />
      </PSSelect>
      
      {isOpen && (
        <View style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '$background',
          borderRadius: '$3',
          borderWidth: 1,
          borderColor: '$borderColor',
          zIndex: 1000,
        }}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                onSelect(option.value)
                setIsOpen(false)
              }}
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderBottomColor: '$borderColor',
              }}
            >
              <Text>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

// PSCheckbox - Checkbox component
interface PSCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

export const PSCheckbox = styled(TouchableOpacity, {
  name: 'PSCheckbox',
  width: 20,
  height: 20,
  borderWidth: 2,
  borderColor: '$borderColor',
  borderRadius: '$1',
  alignItems: 'center',
  justifyContent: 'center',

  variants: {
    checked: {
      true: {
        backgroundColor: '$primary',
        borderColor: '$primary',
      },
    },
    size: {
      small: { width: 16, height: 16 },
      medium: { width: 20, height: 20 },
      large: { width: 24, height: 24 },
    },
    disabled: {
      true: {
        opacity: 0.6,
      },
    },
  } as const,

  defaultVariants: {
    size: 'medium',
  },
})

export const PSCheckboxComponent: React.FC<PSCheckboxProps> = ({
  checked,
  onCheckedChange,
  label,
  disabled,
  size = 'medium',
}) => {
  return (
    <TouchableOpacity
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
      onPress={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
    >
      <PSCheckbox 
        checked={checked} 
        size={size}
        disabled={disabled}
      >
        {checked && <PSIcon name="check" size="small" />}
      </PSCheckbox>
      {label && <Text color={disabled ? '$placeholderColor' : '$color'}>{label}</Text>}
    </TouchableOpacity>
  )
}

// PSSwitch - Switch/Toggle component
interface PSSwitchProps {
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

export const PSSwitchComponent: React.FC<PSSwitchProps> = ({
  value,
  onValueChange,
  disabled,
  size = 'medium',
}) => {
  const theme = useTheme()
  
  const switchProps = {
    small: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
    medium: { transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }] },
    large: { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] },
  }

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: theme.backgroundPress.val, true: theme.primary.val }}
      thumbColor={value ? theme.color.val : theme.background.val}
      style={switchProps[size]}
    />
  )
}

export type PSFormProps = GetProps<typeof PSForm>
export type { PSSelectProps, PSCheckboxProps, PSSwitchProps }