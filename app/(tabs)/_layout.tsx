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
					tabBarIcon: () => "🏠",
				}}
			/>
			<Tabs.Screen
				name="wardrobe"
				options={{
					title: "ワードローブ",
					tabBarIcon: () => "👗",
				}}
			/>
			<Tabs.Screen
				name="styling"
				options={{
					title: "スタイリング",
					tabBarIcon: () => "✨",
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "プロフィール",
					tabBarIcon: () => "👤",
				}}
			/>
		</Tabs>
	);
}
