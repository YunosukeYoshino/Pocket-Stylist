import { Button } from "@tamagui/button";
import { Stack, Text, View } from "@tamagui/core";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView } from "react-native";
import { ProtectedRoute } from "../../src/components/auth/ProtectedRoute";
import { PSHeaderComponent } from "../../src/components/ui/navigation/NavigationComponents";

export default function StylingScreen() {
	return (
		<ProtectedRoute>
			<View flex={1} backgroundColor="$background">
				<PSHeaderComponent title="スタイリング" />

				<ScrollView style={{ flex: 1, padding: 16 }}>
					<Stack
						flexDirection="column"
						gap="$4"
						maxWidth={400}
						width="100%"
						alignSelf="center"
					>
						<Text fontSize="$6" fontWeight="bold" textAlign="center">
							✨ AI スタイリング
						</Text>

						<Text
							fontSize="$4"
							textAlign="center"
							color="$gray11"
							marginBottom="$4"
						>
							AIがあなたに最適なコーディネートを提案します
						</Text>

						<Stack flexDirection="column" gap="$3">
							<Button size="$5" theme="active">
								🎯 今日のおすすめコーデ
							</Button>

							<Button size="$5" variant="outlined">
								🌤️ 天気に合わせたスタイル
							</Button>

							<Button size="$5" variant="outlined">
								📅 イベント別スタイリング
							</Button>

							<Button size="$5" variant="outlined">
								🎨 色合わせ提案
							</Button>

							<Button size="$5" variant="outlined">
								👔 オフィススタイル
							</Button>

							<Button size="$5" variant="outlined">
								🌟 カジュアルスタイル
							</Button>
						</Stack>

						<View
							backgroundColor="$gray2"
							borderRadius="$4"
							padding="$4"
							marginTop="$4"
						>
							<Text fontSize="$4" fontWeight="600" marginBottom="$2">
								💡 スタイリングのヒント
							</Text>
							<Text fontSize="$3" color="$gray11">
								• ワードローブにアイテムを追加して、より良い提案を受けましょう
							</Text>
							<Text fontSize="$3" color="$gray11">
								• 体型情報を設定すると、よりパーソナライズされた提案が可能です
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
