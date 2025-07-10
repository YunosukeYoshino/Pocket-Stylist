import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('expo-router', () => ({
  Link: ({ children, ...props }) => children,
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
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
}));

jest.mock('@tamagui/core', () => ({
  TamaguiProvider: ({ children }) => children,
  View: ({ children, ...props }) => children,
  Text: ({ children, ...props }) => children,
  Button: ({ children, ...props }) => children,
}));