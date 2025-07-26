import { render } from "@testing-library/react-native";
import type React from "react";
import HomeScreen from "../../app/index";
import { AuthProvider } from "../../src/components/auth/AuthProvider";

// Mock TamaguiProvider
const MockTamaguiProvider = ({ children }: { children: React.ReactNode }) => (
	<>{children}</>
);

describe("HomeScreen", () => {
	it("renders the home screen correctly", () => {
		const component = render(
			<MockTamaguiProvider>
				<AuthProvider>
					<HomeScreen />
				</AuthProvider>
			</MockTamaguiProvider>,
		);

		// Check if the component renders without crashing
		expect(component.toJSON()).toBeTruthy();

		// Since we're not authenticated, we should see the auth loading screen
		// Let's test for the actual content that appears
		const jsonOutput = JSON.stringify(component.toJSON());
		expect(jsonOutput).toContain("認証状態を確認中");
		expect(jsonOutput).toContain("アプリの準備をしています");
	});
});
