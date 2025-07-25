import type { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { ApiError } from "../middleware/errorHandler";
import { UserService } from "./user";

// Environment validation
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
	throw new Error(
		"JWT_SECRET and JWT_REFRESH_SECRET environment variables are required",
	);
}

interface DecodedToken {
	sub: string;
	email?: string;
	iat?: number;
	exp?: number;
	type?: string;
	userId?: string;
}

export class AuthService {
	public userService: UserService;

	constructor(prisma: PrismaClient) {
		this.userService = new UserService(prisma);
	}

	async handleLogin(userData: {
		email: string;
		auth0Id: string;
		name?: string;
		avatarUrl?: string;
	}) {
		try {
			// ユーザーを取得または作成
			const user = await this.userService.findOrCreateUser(userData);

			return {
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					avatarUrl: user.avatarUrl,
				},
				message: "Login successful",
			};
		} catch (error) {
			console.error("Login error:", error);
			throw new ApiError("Login failed", 400);
		}
	}

	async handleLogout(_auth0Id: string) {
		try {
			// ログアウト処理（セッション無効化など）
			// この実装では単純にメッセージを返すだけ
			// 実際の環境では、リフレッシュトークンの無効化などを行う
			// TODO: Implement proper logout logic with token invalidation

			return {
				message: "Logout successful",
			};
		} catch (error) {
			console.error("Logout error:", error);
			throw new ApiError("Logout failed", 400);
		}
	}

	async validateToken(token: string) {
		try {
			// JWTトークンのデコード（検証はmiddlewareで実施済み）
			const decoded = jwt.decode(token) as DecodedToken | null;

			if (!decoded || !decoded.sub) {
				throw new ApiError("Invalid token", 401);
			}

			// ユーザー情報を取得
			const user = await this.userService.getUserProfile(decoded.sub);

			return {
				user,
				valid: true,
			};
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			console.error("Token validation error:", error);
			throw new ApiError("Token validation failed", 401);
		}
	}

	generateRefreshToken(userId: string): string {
		// リフレッシュトークンの生成
		// 実際の環境では、より安全な方法でトークンを生成し、データベースに保存する
		return jwt.sign(
			{
				userId,
				type: "refresh",
				iat: Math.floor(Date.now() / 1000),
			},
			process.env.JWT_REFRESH_SECRET!,
			{ expiresIn: "30d" },
		);
	}

	async refreshAccessToken(refreshToken: string) {
		try {
			// Validate environment variables for Auth0
			const auth0Domain = process.env.AUTH0_DOMAIN;
			const auth0ClientId = process.env.AUTH0_CLIENT_ID;
			const auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET;

			if (!auth0Domain || !auth0ClientId || !auth0ClientSecret) {
				throw new ApiError(
					"Auth0 configuration incomplete. Please set AUTH0_DOMAIN, AUTH0_CLIENT_ID, and AUTH0_CLIENT_SECRET environment variables.",
					500,
				);
			}

			// Use Auth0's token endpoint for proper token refresh
			const tokenUrl = `https://${auth0Domain}/oauth/token`;

			const response = await fetch(tokenUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					grant_type: "refresh_token",
					client_id: auth0ClientId,
					client_secret: auth0ClientSecret,
					refresh_token: refreshToken,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Auth0 token refresh failed:", errorData);
				throw new ApiError("Token refresh failed", 401);
			}

			const tokenData = await response.json();

			return {
				accessToken: tokenData.access_token,
				refreshToken: tokenData.refresh_token || refreshToken,
				expiresIn: tokenData.expires_in,
				tokenType: tokenData.token_type || "Bearer",
				message: "Token refreshed successfully",
			};
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			console.error("Token refresh error:", error);
			throw new ApiError("Token refresh failed", 401);
		}
	}
}
