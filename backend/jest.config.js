module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/src/**/*.test.(ts|js)'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        target: 'es2022',
        module: 'commonjs',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: false,
        noImplicitAny: false,
        strictNullChecks: false,
        strictFunctionTypes: false
      }
    }],
  },
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/tests/**',
    '!src/**/*.d.ts',
  ],
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 10000,
  clearMocks: true,
  restoreMocks: true,
}