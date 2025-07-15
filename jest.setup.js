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
    Stack: ({ children, ...props }) => React.createElement('div', props, children),
    Input: ({ children, ...props }) => React.createElement('input', props, children),
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

// Mock Auth0 environment variables
process.env.EXPO_PUBLIC_AUTH0_DOMAIN = 'test.auth0.com'
process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID = 'test_client_id'
process.env.EXPO_PUBLIC_AUTH0_AUDIENCE = 'https://api.test.com'

// Mock the entire auth service
jest.mock('./src/services/auth/authService', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    loginWithSocial: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    refreshAccessToken: jest.fn(),
    isAuthenticated: jest.fn(),
    requestPasswordReset: jest.fn(),
    setupSMSMFA: jest.fn(),
    setupTOTPMFA: jest.fn(),
    verifyMFASetup: jest.fn(),
    verifyMFAChallenge: jest.fn(),
    resendMFACode: jest.fn(),
    getMFASettings: jest.fn(),
    disableMFA: jest.fn(),
    getConfig: jest.fn(() => ({
      domain: 'test.auth0.com',
      clientId: 'test_client_id',
      audience: 'https://api.test.com',
    })),
  },
  authService: {
    login: jest.fn(),
    loginWithSocial: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    refreshAccessToken: jest.fn(),
    isAuthenticated: jest.fn(),
    requestPasswordReset: jest.fn(),
    setupSMSMFA: jest.fn(),
    setupTOTPMFA: jest.fn(),
    verifyMFASetup: jest.fn(),
    verifyMFAChallenge: jest.fn(),
    resendMFACode: jest.fn(),
    getMFASettings: jest.fn(),
    disableMFA: jest.fn(),
    getConfig: jest.fn(() => ({
      domain: 'test.auth0.com',
      clientId: 'test_client_id',
      audience: 'https://api.test.com',
    })),
  },
}))

jest.mock('react-native-auth0', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    webAuth: {
      authorize: jest.fn(),
      clearSession: jest.fn(),
    },
    auth: {
      userInfo: jest.fn(),
      refreshToken: jest.fn(),
      resetPassword: jest.fn(),
    },
  })),
}))

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'test://auth/callback'),
}))

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))
