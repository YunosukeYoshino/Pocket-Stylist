import { Button } from "@tamagui/button";
import { Stack, Text, View } from "@tamagui/core";
import { useRouter } from "expo-router";
import React from "react";

export default function UnauthorizedScreen() {
	const router = useRouter();

	const handleGoBack = () => {
		router.replace("/");
	};

	const handleLogin = () => {
		router.replace("/login");
	};

	return (
		<View
			flex={1}
			backgroundColor="$background"
			padding="$4"
			justifyContent="center"
			alignItems="center"
		>
			<Stack space="$4" alignItems="center" maxWidth={400}>
				<Text fontSize="$8" fontWeight="bold" color="$red10">
					アクセス拒否
				</Text>

				<Text fontSize="$4" textAlign="center" color="$gray11">
					このページまたは機能にアクセスする権限がありません。
				</Text>

				<Text fontSize="$3" textAlign="center" color="$gray10">
					必要な権限やロールが不足している可能性があります。適切なアクセス権を持つアカウントでログインしてください。
				</Text>

				<Stack space="$3" width="100%">
					<Button
						size="$4"
						backgroundColor="$blue10"
						color="white"
						onPress={handleLogin}
					>
						別のアカウントでログイン
					</Button>

					<Button
						size="$4"
						variant="outlined"
						borderColor="$gray8"
						color="$gray11"
						onPress={handleGoBack}
					>
						ホームに戻る
					</Button>
				</Stack>
			</Stack>
		</View>
	);
}
