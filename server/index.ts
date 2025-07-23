import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { errorHandler } from "./middleware/errorHandler";
import {
	healthCheckMiddleware,
	metricsMiddleware,
	requestLoggingMiddleware,
} from "./middleware/monitoring";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { authRouter } from "./routes/auth";
import { bodyProfileRouter } from "./routes/body-profile";
import { userRouter } from "./routes/users";

// 環境変数の読み込み
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(helmet());
app.use(
	cors({
		origin: process.env.ALLOWED_ORIGINS?.split(",") || [
			"http://localhost:19000",
			"exp://localhost:19000",
		],
		credentials: true,
	}),
);

// レート制限
const limiter = rateLimit({
	windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15分 (900000ms)
	max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 15分間に最大100リクエスト
	message: "Too many requests from this IP, please try again later.",
	standardHeaders: true,
	legacyHeaders: false,
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request/Response monitoring and logging middleware
app.use(requestLoggingMiddleware);

// Prismaクライアントをリクエストオブジェクトに注入
app.use((req, _res, next) => {
	req.prisma = prisma;
	next();
});

// ヘルスチェック with detailed monitoring
app.get("/health", healthCheckMiddleware);

// Metrics endpoint (should be secured in production)
app.get("/metrics", metricsMiddleware);

// API バージョニング
const v1Router = express.Router();

// ルート設定
v1Router.use("/auth", authRouter);
v1Router.use("/users", userRouter);
v1Router.use("/users/body-profile", bodyProfileRouter);

app.use("/v1", v1Router);

// エラーハンドリング
app.use(notFoundHandler);
app.use(errorHandler);

// サーバー起動
async function startServer() {
	try {
		// データベース接続確認
		await prisma.$connect();
		console.log("📦 Database connected successfully");

		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
			console.log(`📖 API docs: http://localhost:${PORT}/v1`);
			console.log(`🔍 Health check: http://localhost:${PORT}/health`);
			console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
			console.log("📝 Request logging enabled");
		});
	} catch (error) {
		console.error("❌ Failed to start server:", error);
		process.exit(1);
	}
}

// グレースフルシャットダウン
process.on("SIGINT", async () => {
	console.log("\n🛑 Shutting down gracefully...");
	await prisma.$disconnect();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("\n🛑 Shutting down gracefully...");
	await prisma.$disconnect();
	process.exit(0);
});

// 型拡張
declare global {
	namespace Express {
		interface Request {
			prisma: PrismaClient;
			user?: {
				sub: string;
				email?: string;
				iat?: number;
				exp?: number;
				aud?: string | string[];
				iss?: string;
				scope?: string;
				permissions?: string[];
			};
		}
	}
}

if (require.main === module) {
	startServer();
}

export { app, prisma };
