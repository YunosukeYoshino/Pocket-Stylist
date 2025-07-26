import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

let prisma: PrismaClient | null = null;

export function getPrismaClient(databaseUrl: string): PrismaClient {
	if (!prisma) {
		try {
			const pool = new Pool({
				connectionString: databaseUrl,
				max: 10, // Maximum number of connections
				idleTimeoutMillis: 30000, // Idle timeout
				connectionTimeoutMillis: 2000, // Connection timeout
			});

			const adapter = new PrismaPg(pool as any);

			prisma = new PrismaClient({
				adapter,
				log:
					process.env.NODE_ENV === "development"
						? ["query", "info", "warn", "error"]
						: ["warn", "error"], // Reduce log verbosity in production
			});
		} catch (error) {
			console.error("Failed to initialize PrismaClient:", error);
			throw error;
		}
	}

	return prisma;
}

// Use getPrismaClient() function instead of direct access to avoid null reference issues
