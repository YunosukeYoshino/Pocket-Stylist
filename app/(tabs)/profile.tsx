import { Button } from "@tamagui/button";
import { Stack, Text, View } from "@tamagui/core";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, ScrollView } from "react-native";
import { useAuthContext } from "../../src/components/auth/AuthProvider";
import { ProtectedRoute } from "../../src/components/auth/ProtectedRoute";
import { PSHeader } from "../../src/components/ui/navigation/PSHeader";

export default function ProfileScreen() {
	const { user, logout } = useAuthContext();

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error("Logout error:", error);
			Alert.alert(
				"ログアウトエラー",
				"ログアウトに失敗しました。もう一度お試しください。",
				[{ text: "OK" }],
			);
		}
	};

	return (
		<ProtectedRoute>
			<View flex={1} backgroundColor="$background">
				<PSHeaderComponent title="プロフィール" />

				<ScrollView style={{ flex: 1, padding: 16 }}>
					<Stack
						flexDirection="column"
						gap="$6"
						maxWidth={400}
						width="100%"
						alignSelf="center"
					>
						{/* ユーザー情報 */}
						{user && (
							<View
								backgroundColor="$gray2"
								borderRadius="$6"
								padding="$5"
								width="100%"
							>
								<Stack flexDirection="column" gap="$3">
									<Text fontSize="$6" fontWeight="600">
										ユーザー情報
									</Text>

									<Stack flexDirection="column" gap="$2">
										<Text fontSize="$4" fontWeight="500">
											名前: {user.name || "未設定"}
										</Text>
										<Text fontSize="$4" fontWeight="500">
											メール: {user.email}
										</Text>
										<Text fontSize="$4" fontWeight="500">
											ユーザーID: {user.id}
										</Text>
										{user.roles && user.roles.length > 0 && (
											<Text fontSize="$3" color="$gray11">
												ロール: {user.roles.join(", ")}
											</Text>
										)}
										<Text fontSize="$3" color="$gray11">
											メール認証: {user.email_verified ? "済み ✓" : "未認証"}
										</Text>
									</Stack>
								</Stack>
							</View>
						)}

						{/* 設定項目 */}
						<Stack flexDirection="column" gap="$3">
							<Text fontSize="$5" fontWeight="600">
								設定
							</Text>

							<Button size="$4" variant="outlined">
								スタイル設定
							</Button>

							<Button size="$4" variant="outlined">
								サイズ設定
							</Button>

							<Button size="$4" variant="outlined">
								通知設定
							</Button>

							<Button size="$4" variant="outlined">
								プライバシー設定
							</Button>
						</Stack>

						{/* ナビゲーション */}
						<Stack flexDirection="column" gap="$3" marginTop="$4">
							<Link href="/(tabs)" asChild>
								<Button theme="active" size="$4">
									ホームに戻る
								</Button>
							</Link>

							<Button
								size="$4"
								variant="outlined"
								theme="red"
								onPress={handleLogout}
							>
								ログアウト
							</Button>
						</Stack>

						{/* デバッグ情報（開発時のみ） */}
						{__DEV__ && user && (
							<View
								backgroundColor="$yellow2"
								borderColor="$yellow7"
								borderWidth={1}
								borderRadius="$4"
								padding="$3"
								marginTop="$4"
							>
								<Text fontSize="$3" fontWeight="600" marginBottom="$2">
									Debug Info (開発時のみ表示)
								</Text>
								<Text fontSize="$2" fontFamily="$mono" color="$gray11">
									{JSON.stringify(user, null, 2)}
								</Text>
							</View>
						)}
					</Stack>
				</ScrollView>
				<StatusBar style="auto" />
			</View>
		</ProtectedRoute>
	);
}
