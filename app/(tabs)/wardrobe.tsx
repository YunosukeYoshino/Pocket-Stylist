import { Button } from "@tamagui/button";
import { Stack, Text, View } from "@tamagui/core";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView } from "react-native";
import { ProtectedRoute } from "../../src/components/auth/ProtectedRoute";
import { PSHeaderComponent } from "../../src/components/ui/navigation/NavigationComponents";

export default function WardrobeScreen() {
	return (
		<ProtectedRoute>
			<View flex={1} backgroundColor="$background">
				<PSHeaderComponent title="ワードローブ" />

				<ScrollView style={{ flex: 1, padding: 16 }}>
					<Stack
						flexDirection="column"
						gap="$4"
						maxWidth={400}
						width="100%"
						alignSelf="center"
					>
						<Text fontSize="$6" fontWeight="bold" textAlign="center">
							👗 デジタルワードローブ
						</Text>

						<Text
							fontSize="$4"
							textAlign="center"
							color="$gray11"
							marginBottom="$4"
						>
							あなたの衣服を管理しましょう
						</Text>

						<Stack flexDirection="column" gap="$3">
							<Button size="$5" theme="active">
								📷 新しいアイテムを追加
							</Button>

							<Button size="$5" variant="outlined">
								👕 トップス
							</Button>

							<Button size="$5" variant="outlined">
								👖 ボトムス
							</Button>

							<Button size="$5" variant="outlined">
								👗 ドレス
							</Button>

							<Button size="$5" variant="outlined">
								👞 シューズ
							</Button>

							<Button size="$5" variant="outlined">
								👜 アクセサリー
							</Button>
						</Stack>

						<View
							backgroundColor="$gray2"
							borderRadius="$4"
							padding="$4"
							marginTop="$4"
						>
							<Text fontSize="$4" fontWeight="600" marginBottom="$2">
								📊 ワードローブ統計
							</Text>
							<Text fontSize="$3" color="$gray11">
								総アイテム数: 0
							</Text>
							<Text fontSize="$3" color="$gray11">
								最近追加: なし
							</Text>
						</View>

						<Stack flexDirection="row" gap="$3" marginTop="$4">
							<Link href="/(tabs)" asChild>
								<Button size="$3" variant="outlined" flex={1}>
									ホームに戻る
								</Button>
							</Link>
						</Stack>
					</Stack>
				</ScrollView>
				<StatusBar style="auto" />
			</View>
		</ProtectedRoute>
	);
}
