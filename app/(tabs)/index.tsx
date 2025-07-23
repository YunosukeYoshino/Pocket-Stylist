import { Button } from "@tamagui/button";
import { Stack, Text, View } from "@tamagui/core";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthContext } from "../../src/components/auth/AuthProvider";
import { ProtectedRoute } from "../../src/components/auth/ProtectedRoute";
import { PSHeaderComponent } from "../../src/components/ui/navigation/NavigationComponents";

export default function HomeScreen() {
	const { user, logout } = useAuthContext();
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<ProtectedRoute>
			<View flex={1} backgroundColor="$background">
				<PSHeaderComponent title="ホーム" />

				<View flex={1} alignItems="center" justifyContent="center" padding="$4">
					<Stack
						flexDirection="column"
						alignItems="center"
						gap="$6"
						maxWidth={400}
						width="100%"
					>
						<Text fontSize="$8" fontWeight="bold">
							Pocket Stylist AI
						</Text>

						<Text fontSize="$4" textAlign="center" color="$gray11">
							AI-powered fashion companion
						</Text>

						{user && (
							<View
								backgroundColor="$gray2"
								borderRadius="$4"
								padding="$4"
								width="100%"
							>
								<Text fontSize="$5" fontWeight="600" marginBottom="$2">
									Welcome back! 👋
								</Text>
								<Text fontSize="$3" color="$gray11">
									{user.name || user.email}
								</Text>
								{user.picture && (
									<Text fontSize="$2" color="$gray10" marginTop="$1">
										認証済み ✓
									</Text>
								)}
							</View>
						)}

						<Stack flexDirection="column" gap="$3" width="100%">
							<Link href="/(tabs)/wardrobe" asChild>
								<Button size="$5" theme="active">
									ワードローブ管理
								</Button>
							</Link>

							<Link href="/(tabs)/styling" asChild>
								<Button size="$5" theme="active">
									AI スタイリング
								</Button>
							</Link>

							<Link href="/(tabs)/profile" asChild>
								<Button size="$5" variant="outlined">
									プロフィール設定
								</Button>
							</Link>
						</Stack>

						<Stack flexDirection="row" gap="$3" marginTop="$4">
							<Button size="$3" variant="outlined" onPress={handleLogout}>
								ログアウト
							</Button>
						</Stack>
					</Stack>
					<StatusBar style="auto" />
				</View>
			</View>
		</ProtectedRoute>
	);
}
