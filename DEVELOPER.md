# Pocket Stylist AI - Developer Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- [Bun](https://bun.sh/) package manager
- [Expo CLI](https://docs.expo.dev/get-started/installation/#expo-cli)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YunosukeYoshino/Pocket-Stylist.git
   cd Pocket-Stylist
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start the development server**
   ```bash
   bun start
   ```

### Development Commands

| Command | Description |
|---------|-------------|
| `bun start` | Start Expo development server |
| `bun ios` | Run on iOS simulator |
| `bun android` | Run on Android emulator |
| `bun web` | Run on web browser |
| `bun type-check` | Run TypeScript type checking |
| `bun lint` | Run Biome linting |
| `bun lint:fix` | Fix linting issues automatically |
| `bun format` | Format code with Biome |
| `bun check` | Run both linting and formatting |
| `bun check:fix` | Fix linting and formatting issues |
| `bun test` | Run Jest tests |
| `bun test:watch` | Run tests in watch mode |
| `bun test:coverage` | Run tests with coverage report |

## 🛠️ Technology Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **UI Library**: Tamagui
- **State Management**: Zustand
- **Navigation**: Expo Router
- **Package Manager**: Bun
- **Linting & Formatting**: Biome
- **Testing**: Jest + React Native Testing Library
- **Git Hooks**: Husky

## 📁 Project Structure

```
├── app/                    # App screens (Expo Router)
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home screen
│   └── profile.tsx        # Profile screen
├── assets/                # Static assets
├── components/            # Reusable UI components
├── config/               # Configuration files
│   └── tamagui.config.ts # Tamagui configuration
├── hooks/                # Custom React hooks
├── services/             # API services
├── store/                # Zustand store
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── __tests__/            # Test files
└── docs/                 # Documentation
```

## 🔧 Development Setup

### Environment Variables
Create a `.env.local` file in the root directory:
```bash
# API Configuration
API_BASE_URL=https://api.pocketstylist.ai
CLAUDE_API_KEY=your_claude_api_key

# Auth0 Configuration
AUTH0_DOMAIN=your_auth0_domain
AUTH0_CLIENT_ID=your_auth0_client_id
```

### Git Hooks
Git hooks are automatically installed when you run `bun install`. The pre-commit hook will:
- Run Biome linting and formatting
- Run TypeScript type checking
- Prevent commits with errors

## 📱 Platform-Specific Setup

### iOS Development
1. Install Xcode from the Mac App Store
2. Install iOS Simulator
3. Run `bun ios` to start development

### Android Development
1. Install Android Studio
2. Set up Android Virtual Device (AVD)
3. Configure Android SDK path
4. Run `bun android` to start development

### Web Development
1. Run `bun web` to start web development
2. Open browser at `http://localhost:19006`

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage
```

### E2E Tests
E2E testing setup will be added in future iterations.

## 📊 Code Quality

### Linting and Formatting
We use Biome for both linting and formatting:
```bash
# Check code quality
bun check

# Fix issues automatically
bun check:fix
```

### Type Checking
```bash
# Run TypeScript type checking
bun type-check
```

## 🚢 Build and Deploy

### Development Build
```bash
# Build for development
eas build --profile development
```

### Production Build
```bash
# Build for production
eas build --profile production
```

### Preview Build
```bash
# Build for preview/testing
eas build --profile preview
```

## 📝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `bun test`
4. Run linting: `bun check`
5. Commit your changes: `git commit -m "feat: add your feature"`
6. Push to the branch: `git push origin feature/your-feature`
7. Create a Pull Request

## 🔍 Debugging

### React Native Debugger
1. Install React Native Debugger
2. Start the app with `bun start`
3. Open debugger and connect

### Expo DevTools
1. Start with `bun start`
2. Press `d` to open developer menu
3. Select "Debug JS Remotely"

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Tamagui Documentation](https://tamagui.dev/)
- [Biome Documentation](https://biomejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🆘 Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   # Clear cache
   bun start --clear
   ```

2. **iOS simulator issues**
   ```bash
   # Reset iOS simulator
   xcrun simctl erase all
   ```

3. **Android emulator issues**
   ```bash
   # Wipe emulator data
   # Go to Android Studio > AVD Manager > Wipe Data
   ```

4. **Dependencies issues**
   ```bash
   # Clean install
   rm -rf node_modules bun.lockb
   bun install
   ```

## 📞 Support

For development questions or issues:
- Check the [documentation](./docs/)
- Create an issue in the repository
- Contact the development team

---

Happy coding! 🎉