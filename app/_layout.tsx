import { TamaguiProvider } from "@tamagui/core";
import { Stack } from "expo-router";
import { tamaguiConfig } from "../config/tamagui.config";
import { AuthProvider } from "../src/components/auth/AuthProvider";

export default function RootLayout() {
	return (
		<TamaguiProvider config={tamaguiConfig}>
			<AuthProvider>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen name="login" options={{ title: "Login" }} />
					<Stack.Screen
						name="unauthorized"
						options={{ title: "Unauthorized" }}
					/>
				</Stack>
			</AuthProvider>
		</TamaguiProvider>
	);
}
