module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/src"],
	testMatch: ["**/src/**/*.test.(ts|js)"],
	globals: {
		"ts-jest": {
			isolatedModules: true,
			tsconfig: {
				target: "es2022",
				module: "commonjs",
				esModuleInterop: true,
				allowSyntheticDefaultImports: true,
				skipLibCheck: true,
				strict: false,
				noImplicitAny: false,
				strictNullChecks: false,
				strictFunctionTypes: false,
				strictPropertyInitialization: false,
				noImplicitThis: false,
				noImplicitReturns: false,
				exactOptionalPropertyTypes: false,
			},
		},
	},
	transform: {
		"^.+\\.ts$": "ts-jest",
	},
	collectCoverageFrom: ["src/**/*.{ts,js}", "!src/tests/**", "!src/**/*.d.ts"],
	setupFiles: ["./jest.setup.js"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
	testTimeout: 10000,
	clearMocks: true,
	restoreMocks: true,
};
