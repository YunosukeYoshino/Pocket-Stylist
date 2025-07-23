import { type GetProps, styled } from '@tamagui/core'
import React from 'react'
import { View } from 'react-native'

export const Container = styled(View, {
  name: 'PSContainer',
  flex: 1,
  backgroundColor: '$background',
  paddingHorizontal: '$4',

  variants: {
    centered: {
      true: {
        justifyContent: 'center',
        alignItems: 'center',
      },
    },
    safe: {
      true: {
        paddingTop: '$8',
      },
    },
    fullWidth: {
      true: {
        paddingHorizontal: 0,
      },
    },
    spacing: {
      none: { padding: 0 },
      xs: { padding: '$1' },
      sm: { padding: '$2' },
      md: { padding: '$4' },
      lg: { padding: '$6' },
      xl: { padding: '$8' },
    },
  } as const,

  defaultVariants: {
    spacing: 'md',
  },
})

export const Stack = styled(View, {
  name: 'PSStack',

  variants: {
    direction: {
      horizontal: {
        flexDirection: 'row',
      },
      vertical: {
        flexDirection: 'column',
      },
    },
    spacing: {
      xs: { gap: '$1' },
      sm: { gap: '$2' },
      md: { gap: '$3' },
      lg: { gap: '$4' },
      xl: { gap: '$6' },
    },
    align: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      stretch: { alignItems: 'stretch' },
    },
    justify: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
      around: { justifyContent: 'space-around' },
      evenly: { justifyContent: 'space-evenly' },
    },
    wrap: {
      true: { flexWrap: 'wrap' },
      false: { flexWrap: 'nowrap' },
    },
  } as const,

  defaultVariants: {
    direction: 'vertical',
    spacing: 'md',
    align: 'stretch',
  },
})

export const Card = styled(View, {
  name: 'PSCard',
  backgroundColor: '$background',
  borderRadius: '$4',
  padding: '$4',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  borderWidth: 1,
  borderColor: '$borderColor',

  variants: {
    variant: {
      elevated: {
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      outlined: {
        shadowOpacity: 0,
        borderWidth: 1,
        borderColor: '$borderColor',
      },
      filled: {
        backgroundColor: '$backgroundHover',
        shadowOpacity: 0,
        borderWidth: 0,
      },
    },
    padding: {
      none: { padding: 0 },
      sm: { padding: '$2' },
      md: { padding: '$4' },
      lg: { padding: '$6' },
    },
    pressable: {
      true: {
        hoverStyle: {
          backgroundColor: '$backgroundHover',
        },
        pressStyle: {
          backgroundColor: '$backgroundPress',
        },
      },
    },
  } as const,

  defaultVariants: {
    variant: 'elevated',
    padding: 'md',
  },
})

export const Grid = styled(View, {
  name: 'PSGrid',
  flexDirection: 'row',
  flexWrap: 'wrap',

  variants: {
    columns: {
      1: { width: '100%' },
      2: { width: '50%' },
      3: { width: '33.333%' },
      4: { width: '25%' },
      5: { width: '20%' },
      6: { width: '16.666%' },
    },
    spacing: {
      xs: { gap: '$1' },
      sm: { gap: '$2' },
      md: { gap: '$3' },
      lg: { gap: '$4' },
      xl: { gap: '$6' },
    },
    align: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      stretch: { alignItems: 'stretch' },
    },
    justify: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
      around: { justifyContent: 'space-around' },
      evenly: { justifyContent: 'space-evenly' },
    },
  } as const,

  defaultVariants: {
    columns: 2,
    spacing: 'md',
  },
})

export const GridItem = styled(View, {
  name: 'PSGridItem',
  
  variants: {
    span: {
      1: { flex: 1 },
      2: { flex: 2 },
      3: { flex: 3 },
      4: { flex: 4 },
      5: { flex: 5 },
      6: { flex: 6 },
      full: { width: '100%' },
    },
  } as const,

  defaultVariants: {
    span: 1,
  },
})

export type ContainerProps = GetProps<typeof Container>
export type StackProps = GetProps<typeof Stack>
export type CardProps = GetProps<typeof Card>
export type GridProps = GetProps<typeof Grid>
export type GridItemProps = GetProps<typeof GridItem>
