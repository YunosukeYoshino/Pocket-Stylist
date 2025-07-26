import { Text, View } from "@tamagui/core";
import { StatusBar } from "expo-status-bar";
import type React from "react";
import { ActivityIndicator } from "react-native";

export const AuthLoadingScreen: React.FC = () => {
	return (
		<View
			flex={1}
			alignItems="center"
			justifyContent="center"
			backgroundColor="$background"
		>
			<View alignItems="center" gap="$4">
				<ActivityIndicator size="large" color="$blue10" />
				<Text fontSize="$6" fontWeight="600" color="$gray12">
					認証状態を確認中...
				</Text>
				<Text fontSize="$3" color="$gray11" textAlign="center" maxWidth={200}>
					アプリの準備をしています
				</Text>
			</View>
			<StatusBar style="auto" />
		</View>
	);
};

export default AuthLoadingScreen;
