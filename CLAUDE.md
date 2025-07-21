# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚫 Code Quality Rules

### No Hardcoding Policy

**NEVER hardcode the following values in the codebase:**

1. **Environment Variables**
   - API keys, secrets, tokens
   - Database URLs and credentials
   - Service endpoints and URLs
   - Port numbers and host addresses
   - Feature flags and configuration values

2. **API Configurations**
   - Service URLs (Auth0, Cloudflare, Gemini API, etc.)
   - Bucket names and storage paths
   - Rate limits and timeouts
   - API versions and endpoints

3. **Business Logic Values**
   - File size limits
   - Validation rules and constraints
   - Default categories and enums
   - Pricing and quota values

### ✅ Correct Approach

Always use environment variables or configuration files:

```typescript
// ❌ BAD - Hardcoded
const bucketName = 'pocket-stylist-files'
const apiUrl = 'https://api.example.com/v1'
const maxFileSize = 10485760 // 10MB

// ✅ GOOD - Environment variables
const bucketName = env.R2_BUCKET_NAME
const apiUrl = env.API_BASE_URL
const maxFileSize = parseInt(env.MAX_FILE_SIZE_BYTES || '10485760')
```

### Configuration Management

1. **Store all configurable values in `.env.example`**
2. **Use type-safe environment variable loading in `backend/src/config/env.ts`**
3. **Provide sensible defaults where appropriate**
4. **Validate environment variables at startup using Zod schemas**

### Environment Variable Naming

Use consistent naming conventions:
- `SERVICE_SETTING_NAME` format
- Prefix with service name (e.g., `R2_BUCKET_NAME`, `AUTH0_DOMAIN`, `GEMINI_API_KEY`)
- Use descriptive names (e.g., `GEMINI_MAX_TOKENS` not `MAX_TOKENS`)

## 🏗 Architecture Overview

### Project Structure

This is a **multi-service monorepo** with three main components:

1. **Frontend** (`/app`, `/src`) - React Native + Expo mobile app
2. **Server** (`/server`) - Express.js API server for user management and authentication
3. **Backend** (`/backend`) - Express.js API server for AI services and garment management

### Key Services Architecture

#### AI Services Layer
- **GeminiService** (`backend/src/services/GeminiService.ts`) - Primary AI service (migrated from Claude)
- **ClaudeService** (`backend/src/services/ClaudeService.ts`) - Legacy AI service (being phased out)
- **RecommendationService** (`backend/src/services/RecommendationService.ts`) - High-level recommendation orchestration
- **GarmentImageRecognitionService** (`backend/src/services/garmentImageRecognitionService.ts`) - Image analysis for garments

#### Data Layer
- **Prisma ORM** - Database abstraction with PostgreSQL
- **RedisService** (`backend/src/services/RedisService.ts`) - Caching layer
- **R2Service** (`backend/src/services/r2Service.ts`) - Cloudflare R2 file storage

#### Service Communication Pattern
```
API Routes → Controllers → Services → Repositories/External APIs
```

### Environment Configuration

The project uses **dual environment systems**:
- **Root level** - Frontend/server configuration
- **Backend level** - Backend-specific configuration with comprehensive validation

Environment validation happens in `backend/src/config/env.ts` using Zod schemas.

## 🛠 Development Commands

### Full Stack Development
```bash
# Install all dependencies
npm run setup

# Run full development environment
npm run dev:full

# Start individual services
npm run start              # Frontend (Expo)
npm run server:dev         # Server (Express)
npm run backend:dev        # Backend (Express)
```

### Frontend (React Native/Expo)
```bash
npm run start              # Start Expo dev server
npm run android            # Run on Android
npm run ios                # Run on iOS
npm run web                # Run on web
```

### Backend Development
```bash
cd backend
npm run dev                # Development server with watch
npm run build              # Build TypeScript
npm run start              # Production server

# Database operations
npm run db:generate        # Generate Prisma client
npm run db:migrate         # Run migrations
npm run db:seed            # Seed database
npm run db:studio          # Open Prisma Studio
```

### Testing

The project uses **Jest with multi-project configuration**:

```bash
# Run all tests
npm test

# Specific project tests
npm run test:server        # Server API tests
npm run test:client        # React Native tests
npm run backend:test       # Backend API tests

# Test patterns
npm test -- --testPathPattern="GeminiService"
npm test -- --testNamePattern="should handle errors"

# Coverage
npm run test:coverage
npm run backend:test -- --coverage
```

### Code Quality
```bash
# Linting and formatting (uses Biome)
npm run lint
npm run lint:fix
npm run format
npm run check
npm run check:fix

# Type checking
npm run type-check
npm run backend:build      # Backend TypeScript check
```

### Docker Operations
```bash
npm run docker:up         # Start services
npm run docker:down       # Stop services
npm run docker:logs       # View logs
```

## 🔧 Testing Guidelines

### Test File Locations
- **Backend tests**: `backend/src/tests/*.test.ts`
- **Server tests**: `server/**/*.test.ts`
- **Frontend tests**: `app/**/*.test.tsx`

### Mock Patterns for AI Services

When testing AI services, use proper mock setup:

```typescript
// Mock environment variables first
process.env.GEMINI_API_KEY = 'test-key'

// Mock the Google AI SDK
jest.doMock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockImplementation(() => ({
      generateContent: mockGenerateContent
    }))
  }))
}))

// Import service after mocks
const { GeminiService } = jest.requireActual('../services/GeminiService') as any
```

### Test Configuration

Tests are configured with relaxed TypeScript settings for better mock compatibility. Each project has separate Jest configurations optimized for their specific needs.

## 🔄 Service Migration Patterns

### AI Service Migration (Claude → Gemini)

When working with AI services, note the migration pattern:
- **GeminiService** is the primary AI service
- **ClaudeService** exists for backward compatibility
- Both services implement identical interfaces for seamless swapping
- Migration involved updating service dependencies across multiple layers

### Service Interface Consistency

All AI services must maintain consistent interfaces:
```typescript
generateStylingRecommendations(input: StylingRecommendationInput): Promise<StylingRecommendationOutput>
analyzeImageWithVision(input: {image: string, prompt: string, isBase64?: boolean, userId?: string}): Promise<string>
```

## 📦 Package Management

- **Package Manager**: Bun (preferred) and npm
- **Frontend deps**: Root `package.json`
- **Backend deps**: `backend/package.json`
- **Workspaces**: Not used - each service manages its own dependencies

## 🔒 Security Considerations

### Environment Variables
- All sensitive values MUST be in environment variables
- Never commit `.env` files
- Use `.env.example` to document required variables
- Validate all environment variables with Zod schemas

### API Security
- Auth0 integration for authentication
- JWT tokens for authorization
- Rate limiting on all public endpoints
- Helmet.js for security headers

## 🎯 Common Development Patterns

### Error Handling
- Custom error classes (`GeminiAPIError`, `RecommendationError`)
- Consistent error response format
- Comprehensive logging with Winston

### Caching Strategy
- Redis for API response caching
- TTL-based invalidation
- Cache keys use user ID + input hash pattern

### Database Patterns
- Prisma ORM with PostgreSQL
- Repository pattern for data access
- Migration-based schema management
- Seeding for development data

## 🎨 Tamagui Design System

The project uses **Tamagui v3** as the foundation for the design system:

### Configuration
- Main config: `config/tamagui.config.ts` - Simplified configuration extending base Tamagui config
- Component library: `src/components/ui/` - Custom UI components built on Tamagui primitives

### Design Tokens
- **Primary Brand Color**: `#E14F5A` (red-pink)
- **Theme Support**: Light/dark mode with automatic switching
- **Typography**: Consistent scale with Tamagui's built-in typography system

### Usage Pattern
Components follow Tamagui's styled-component pattern with theme-aware styling and responsive design built-in.

## 🌐 Browser Testing with Playwright MCP

### Post-Development Browser Verification

**MANDATORY**: After completing any frontend development work, you MUST verify the application works correctly in the browser using Playwright MCP.

#### When to Use Browser Testing
- After implementing new UI components
- After fixing styling or layout issues
- After making changes to routing or navigation
- After resolving TypeScript or build errors
- Before committing changes to frontend code

#### Browser Testing Process

1. **Start the development server** (if not already running):
   ```bash
   npm run start  # Expo dev server
   ```

2. **Use Playwright MCP tools to verify functionality**:
   - Navigate to the application URL (typically `http://localhost:8081/`)
   - Take screenshots to verify visual appearance
   - Test key user interactions (navigation, forms, buttons)
   - Verify responsive design across different viewport sizes
   - Check theme switching functionality if applicable

3. **Document any issues found** and fix before proceeding

#### Example Browser Testing Commands
```typescript
// Navigate to app
await mcp__playwright__browser_navigate({ url: "http://localhost:8081/" })

// Take screenshot for verification
await mcp__playwright__browser_take_screenshot({ filename: "app-verification.png" })

// Test component interactions
await mcp__playwright__browser_click({ element: "theme toggle button", ref: "button-ref" })

// Verify different viewport sizes
await mcp__playwright__browser_resize({ width: 375, height: 812 }) // Mobile
await mcp__playwright__browser_resize({ width: 1024, height: 768 }) // Tablet
```

This ensures all changes work correctly in the actual browser environment before code review or deployment.

## 📋 Review Checklist

Before submitting code, ensure:
- [ ] No hardcoded values (see policy above)
- [ ] Environment variables documented in `.env.example`
- [ ] Tests pass for affected components
- [ ] TypeScript compilation succeeds
- [ ] Biome linting passes
- [ ] Proper error handling implemented
- [ ] Service interfaces remain consistent
- [ ] **Browser verification completed using Playwright MCP** (for frontend changes)