import { Text } from "@tamagui/core";
import { Tabs } from "expo-router";
import { PSTabBar } from "../../src/components/ui/navigation/PSTabBar";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
			}}
			tabBar={(props) => <PSTabBar {...props} />}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "ホーム",
					tabBarIcon: ({ color, size }) => (
						<Text style={{ color, fontSize: size }}>🏠</Text>
					),
				}}
			/>
			<Tabs.Screen
				name="wardrobe"
				options={{
					title: "ワードローブ",
					tabBarIcon: ({ color, size }) => (
						<Text style={{ color, fontSize: size }}>👗</Text>
					),
				}}
			/>
			<Tabs.Screen
				name="styling"
				options={{
					title: "スタイリング",
					tabBarIcon: ({ color, size }) => (
						<Text style={{ color, fontSize: size }}>✨</Text>
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "プロフィール",
					tabBarIcon: ({ color, size }) => (
						<Text style={{ color, fontSize: size }}>👤</Text>
					),
				}}
			/>
		</Tabs>
	);
}
