import 'react-native-gesture-handler/jestSetup'

// Add missing polyfills for React Native
global.clearImmediate =
  global.clearImmediate ||
  (id => {
    clearTimeout(id)
  })

global.setImmediate = global.setImmediate || (fn => setTimeout(fn, 0))

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  return Reanimated
})

jest.mock('expo-router', () => {
  const React = require('react')
  return {
    Link: ({ children, asChild, ...props }) => {
      if (asChild) {
        return React.cloneElement(children, { ...props, href: props.href })
      }
      return React.createElement('a', props, children)
    },
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
    },
    Stack: {
      Screen: ({ children, ...props }) => children,
    },
    useLocalSearchParams: () => ({}),
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
    }),
  }
})

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
}))

jest.mock('@tamagui/core', () => {
  const React = require('react')
  return {
    TamaguiProvider: ({ children }) => children,
    View: ({ children, ...props }) => React.createElement('div', props, children),
    Text: ({ children, ...props }) => React.createElement('span', props, children),
    Button: ({ children, ...props }) => React.createElement('button', props, children),
  }
})

jest.mock('@tamagui/button', () => {
  const React = require('react')
  return {
    Button: ({ children, ...props }) => React.createElement('button', props, children),
  }
})

jest.mock('expo-status-bar', () => ({
  StatusBar: ({ style, ...props }) => null,
}))
