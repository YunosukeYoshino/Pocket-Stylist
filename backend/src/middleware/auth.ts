import type { Context, Next } from "hono";
import type { AuthContext, Env, User } from "../index";

export async function authMiddleware(
	c: Context<{ Bindings: Env; Variables: AuthContext }>,
	next: Next,
): Promise<Response | undefined> {
	try {
		const authorization = c.req.header("Authorization");

		if (!authorization) {
			return c.json({ error: "Authorization header required" }, 401);
		}

		const token = authorization.startsWith("Bearer ")
			? authorization.slice(7)
			: "";

		if (!token) {
			return c.json({ error: "Bearer token required" }, 401);
		}

		// Basic JWT format validation
		const jwtParts = token.split(".");
		if (jwtParts.length !== 3) {
			return c.json({ error: "Invalid token format" }, 401);
		}

		// Verify JWT token with Auth0 with timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

		const response = await fetch(`https://${c.env.AUTH0_DOMAIN}/userinfo`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			return c.json({ error: "Invalid token" }, 401);
		}

		const user = (await response.json()) as User;

		// Store user info in context
		c.set("user", user);

		await next();
		return;
	} catch (error) {
		console.error("Auth middleware error:", {
			message: error instanceof Error ? error.message : "Unknown error",
			timestamp: new Date().toISOString(),
		});
		return c.json({ error: "Authentication failed" }, 401);
	}
}
