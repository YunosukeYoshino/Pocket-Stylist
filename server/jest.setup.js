// Server-specific Jest setup
const { PrismaClient } = require('@prisma/client')

// Mock Prisma Client for testing
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    bodyProfile: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}))

// Mock JWT tokens for testing
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ sub: 'test-user-id', email: 'test@example.com' })),
  decode: jest.fn(() => ({ sub: 'test-user-id', email: 'test@example.com' })),
}))

// Mock Auth0 fetch calls
global.fetch = jest.fn()

// Setup test environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
process.env.AUTH0_DOMAIN = 'test-domain.auth0.com'
process.env.AUTH0_AUDIENCE = 'test-audience'
process.env.AUTH0_CLIENT_ID = 'test-client-id'
process.env.AUTH0_CLIENT_SECRET = 'test-client-secret'

// Increase timeout for integration tests
jest.setTimeout(30000)

// Console spy to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleLog = console.log

beforeAll(() => {
  console.error = jest.fn()
  console.warn = jest.fn()
  console.log = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
  console.log = originalConsoleLog
})

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})