module.exports = {
	projects: [
		// React Native/Expo project configuration
		{
			displayName: "React Native",
			preset: "jest-expo",
			testEnvironment: "jsdom",
			testMatch: [
				"<rootDir>/app/**/*.test.{ts,tsx}",
				"<rootDir>/components/**/*.test.{ts,tsx}",
				"<rootDir>/hooks/**/*.test.{ts,tsx}",
			],
			setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
			moduleNameMapper: {
				"^@/(.*)$": "<rootDir>/$1",
			},
			transformIgnorePatterns: [
				"node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@tamagui/.*|@react-native/.*)",
			],
			collectCoverageFrom: [
				"app/**/*.{ts,tsx}",
				"components/**/*.{ts,tsx}",
				"hooks/**/*.{ts,tsx}",
				"utils/**/*.{ts,tsx}",
				"!**/*.d.ts",
				"!**/node_modules/**",
			],
		},
		// Server/API project configuration
		{
			displayName: "Server API",
			testEnvironment: "node",
			testMatch: ["<rootDir>/server/**/*.test.{ts,js}"],
			setupFilesAfterEnv: ["<rootDir>/server/jest.setup.js"],
			moduleNameMapper: {
				"^@/(.*)$": "<rootDir>/$1",
				"^@server/(.*)$": "<rootDir>/server/$1",
			},
			transform: {
				"^.+\\.(ts|tsx)$": "ts-jest",
			},
			collectCoverageFrom: [
				"server/**/*.{ts,js}",
				"!server/**/*.d.ts",
				"!server/node_modules/**",
				"!server/dist/**",
				"!server/jest.setup.js",
				"!server/index.ts", // Entry point usually excluded from coverage
			],
			coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/coverage/"],
		},
		// Backend project configuration
		{
			displayName: "Backend API",
			testEnvironment: "node",
			testMatch: ["<rootDir>/backend/src/**/*.test.{ts,js}"],
			setupFiles: ["<rootDir>/backend/jest.setup.js"],
			transform: {
				"^.+\\.(ts|tsx)$": [
					"ts-jest",
					{
						tsconfig: {
							target: "es2022",
							module: "commonjs",
							esModuleInterop: true,
							allowSyntheticDefaultImports: true,
							strict: false,
							isolatedModules: false,
						},
					},
				],
			},
			preset: "ts-jest",
			moduleNameMapper: {
				"^@/(.*)$": "<rootDir>/$1",
				"^@backend/(.*)$": "<rootDir>/backend/$1",
			},
			collectCoverageFrom: [
				"backend/src/**/*.{ts,js}",
				"!backend/src/**/*.d.ts",
				"!backend/node_modules/**",
				"!backend/dist/**",
				"!backend/src/tests/**",
				"!backend/src/server.ts", // Entry point usually excluded from coverage
			],
			coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/coverage/"],
			roots: ["<rootDir>/backend/src"],
			testPathIgnorePatterns: ["/node_modules/", "/dist/"],
		},
	],
	coverageReporters: ["text", "lcov", "html"],
	coverageDirectory: "coverage",
	collectCoverage: true,
};
