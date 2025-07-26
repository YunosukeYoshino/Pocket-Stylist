import { Button } from "@tamagui/button";
import { Stack, Text, View } from "@tamagui/core";
import { StatusBar } from "expo-status-bar";
import type React from "react";
import { useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import type { AuthError } from "../../types/auth";
import { useAuthContext } from "./AuthProvider";

export const LoginScreen: React.FC = () => {
	const {
		login,
		loginWithGoogle,
		loginWithApple,
		loginWithFacebook,
		isLoading,
		error,
		clearError,
	} = useAuthContext();
	const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

	// 共通ログインハンドラを生成するファクトリー関数
	const createLoginHandler = (
		provider: string,
		loginFn: () => Promise<void>,
		errorTitle: string,
	) => {
		return async () => {
			try {
				setLoadingProvider(provider);
				clearError();
				await loginFn();
			} catch (error) {
				const authError = error as AuthError;
				Alert.alert(
					errorTitle,
					authError.message || `${errorTitle}に失敗しました`,
				);
			} finally {
				setLoadingProvider(null);
			}
		};
	};

	// 各プロバイダー向けのログインハンドラーを共通ファクトリーで生成
	const handleLogin = createLoginHandler("email", login, "ログインエラー");
	const handleGoogleLogin = createLoginHandler(
		"google",
		loginWithGoogle,
		"Googleログインエラー",
	);
	const handleAppleLogin = createLoginHandler(
		"apple",
		loginWithApple,
		"Appleログインエラー",
	);
	const handleFacebookLogin = createLoginHandler(
		"facebook",
		loginWithFacebook,
		"Facebookログインエラー",
	);

	const isProviderLoading = (provider: string) => {
		return loadingProvider === provider;
	};

	return (
		<View flex={1} backgroundColor="$background">
			<StatusBar style="auto" />

			{/* ヘッダー */}
			<View flex={1} justifyContent="center" alignItems="center" padding="$6">
				<Stack
					flexDirection="column"
					alignItems="center"
					gap="$6"
					maxWidth={350}
					width="100%"
				>
					{/* ロゴ・タイトル */}
					<Stack flexDirection="column" alignItems="center" gap="$3">
						<Text fontSize="$10" fontWeight="bold" color="$gray12">
							Pocket Stylist AI
						</Text>
						<Text fontSize="$4" color="$gray11" textAlign="center">
							AIが提案する、あなただけのファッション
						</Text>
					</Stack>

					{/* エラーメッセージ */}
					{error && (
						<View
							backgroundColor="$red2"
							borderColor="$red7"
							borderWidth={1}
							borderRadius="$4"
							padding="$3"
							width="100%"
						>
							<Text color="$red11" fontSize="$3" textAlign="center">
								{error}
							</Text>
						</View>
					)}

					{/* ログインボタン群 */}
					<Stack flexDirection="column" gap="$4" width="100%">
						{/* メール・パスワードログイン */}
						<Button
							theme="active"
							size="$5"
							onPress={handleLogin}
							disabled={isLoading}
							width="100%"
							icon={
								isProviderLoading("email") ? (
									<ActivityIndicator color="white" />
								) : undefined
							}
						>
							<Text color="$white1" fontWeight="600">
								{isProviderLoading("email")
									? "ログイン中..."
									: "メールでログイン"}
							</Text>
						</Button>

						{/* 区切り線 */}
						<Stack
							flexDirection="row"
							alignItems="center"
							gap="$3"
							marginVertical="$2"
						>
							<View flex={1} height={1} backgroundColor="$gray6" />
							<Text fontSize="$2" color="$gray10">
								または
							</Text>
							<View flex={1} height={1} backgroundColor="$gray6" />
						</Stack>

						{/* Googleログイン */}
						<Button
							backgroundColor="$white1"
							borderColor="$gray7"
							borderWidth={1}
							size="$5"
							onPress={handleGoogleLogin}
							disabled={isLoading}
							width="100%"
							icon={
								isProviderLoading("google") ? (
									<ActivityIndicator color="black" />
								) : undefined
							}
						>
							<Text color="$gray12" fontWeight="600">
								{isProviderLoading("google") ? "接続中..." : "Googleでログイン"}
							</Text>
						</Button>

						{/* Appleログイン */}
						<Button
							backgroundColor="$black"
							size="$5"
							onPress={handleAppleLogin}
							disabled={isLoading}
							width="100%"
							icon={
								isProviderLoading("apple") ? (
									<ActivityIndicator color="white" />
								) : undefined
							}
						>
							<Text color="$white1" fontWeight="600">
								{isProviderLoading("apple") ? "接続中..." : "Appleでログイン"}
							</Text>
						</Button>

						{/* Facebookログイン */}
						<Button
							backgroundColor="$blue10"
							size="$5"
							onPress={handleFacebookLogin}
							disabled={isLoading}
							width="100%"
							icon={
								isProviderLoading("facebook") ? (
									<ActivityIndicator color="white" />
								) : undefined
							}
						>
							<Text color="$white1" fontWeight="600">
								{isProviderLoading("facebook")
									? "接続中..."
									: "Facebookでログイン"}
							</Text>
						</Button>
					</Stack>

					{/* 注意事項 */}
					<Text fontSize="$2" color="$gray10" textAlign="center" marginTop="$4">
						ログインすることで、利用規約とプライバシーポリシーに同意したものとします
					</Text>
				</Stack>
			</View>
		</View>
	);
};

export default LoginScreen;
