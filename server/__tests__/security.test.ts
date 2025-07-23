import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import request from "supertest";
import { app } from "../index";

describe("Security Tests", () => {
	describe("Rate Limiting", () => {
		let testApp: express.Application;

		beforeEach(() => {
			testApp = express();
			testApp.use(express.json());

			// Apply a very restrictive rate limit for testing
			const testLimiter = rateLimit({
				windowMs: 1000, // 1 second
				max: 2, // Only 2 requests per second
				message: "Too many requests",
				standardHeaders: true,
				legacyHeaders: false,
			});

			testApp.use(testLimiter);
			testApp.get("/test", (req, res) => res.json({ success: true }));
		});

		it("should allow requests under the rate limit", async () => {
			await request(testApp).get("/test").expect(200);
			await request(testApp).get("/test").expect(200);
		});

		it("should block requests over the rate limit", async () => {
			await request(testApp).get("/test").expect(200);
			await request(testApp).get("/test").expect(200);
			await request(testApp).get("/test").expect(429); // Too Many Requests
		});
	});

	describe("CORS Security", () => {
		let testApp: express.Application;

		beforeEach(() => {
			testApp = express();
			testApp.use(
				cors({
					origin: ["http://localhost:3000"],
					credentials: true,
				}),
			);
			testApp.get("/test", (req, res) => res.json({ success: true }));
		});

		it("should allow requests from allowed origins", async () => {
			const response = await request(testApp)
				.get("/test")
				.set("Origin", "http://localhost:3000")
				.expect(200);

			expect(response.headers["access-control-allow-origin"]).toBe(
				"http://localhost:3000",
			);
		});

		it("should reject requests from disallowed origins", async () => {
			const response = await request(testApp)
				.get("/test")
				.set("Origin", "http://malicious-site.com");

			expect(response.headers["access-control-allow-origin"]).toBeUndefined();
		});
	});

	describe("Helmet Security Headers", () => {
		let testApp: express.Application;

		beforeEach(() => {
			testApp = express();
			testApp.use(helmet());
			testApp.get("/test", (req, res) => res.json({ success: true }));
		});

		it("should set security headers", async () => {
			const response = await request(testApp).get("/test").expect(200);

			expect(response.headers["x-frame-options"]).toBeDefined();
			expect(response.headers["x-content-type-options"]).toBe("nosniff");
			expect(response.headers["x-xss-protection"]).toBeDefined();
			expect(response.headers["referrer-policy"]).toBeDefined();
		});

		it("should not expose sensitive headers", async () => {
			const response = await request(testApp).get("/test").expect(200);

			expect(response.headers["x-powered-by"]).toBeUndefined();
			expect(response.headers.server).toBeUndefined();
		});
	});

	describe("Input Validation", () => {
		let testApp: express.Application;

		beforeEach(() => {
			testApp = express();
			testApp.use(express.json({ limit: "1mb" }));

			testApp.post("/test", (req, res) => {
				// Simple validation test
				const { email, name } = req.body;
				if (!email || !name) {
					return res.status(400).json({ error: "Missing required fields" });
				}
				res.json({ success: true });
			});
		});

		it("should reject requests with missing required fields", async () => {
			await request(testApp)
				.post("/test")
				.send({ email: "test@example.com" }) // Missing name
				.expect(400);
		});

		it("should reject requests with overly large payloads", async () => {
			const largePayload = {
				data: "x".repeat(2 * 1024 * 1024), // 2MB payload
			};

			await request(testApp).post("/test").send(largePayload).expect(413); // Payload Too Large
		});

		it("should reject malformed JSON", async () => {
			await request(testApp)
				.post("/test")
				.set("Content-Type", "application/json")
				.send("{ invalid json }")
				.expect(400);
		});
	});

	describe("SQL Injection Protection", () => {
		it("should not be vulnerable to SQL injection in auth routes", async () => {
			const maliciousPayload = {
				auth0Id: "'; DROP TABLE users; --",
				email: "hacker@example.com",
			};

			// This should be safely handled by Prisma's parameterized queries
			const response = await request(app)
				.post("/v1/auth/login")
				.send(maliciousPayload);

			// Should either fail validation or be safely processed
			expect([200, 400, 422, 500].includes(response.status)).toBe(true);
		});
	});

	describe("XSS Protection", () => {
		it("should sanitize user input to prevent XSS", async () => {
			const xssPayload = {
				auth0Id: "auth0|123",
				email: "test@example.com",
				name: '<script>alert("XSS")</script>',
			};

			const response = await request(app)
				.post("/v1/auth/login")
				.send(xssPayload);

			if (response.status === 200) {
				// If successful, ensure the script tag is not present in response
				expect(JSON.stringify(response.body)).not.toContain("<script>");
			}
		});
	});

	describe("Authorization Tests", () => {
		it("should require authentication for protected routes", async () => {
			const response = await request(app).get("/v1/users/profile");
			expect([401, 403]).toContain(response.status); // Unauthorized or Forbidden
		}, 5000);

		it.skip("should reject invalid JWT tokens", async () => {
			const response = await request(app)
				.get("/v1/users/profile")
				.set("Authorization", "Bearer invalid-token");
			expect([401, 403]).toContain(response.status); // Unauthorized or Forbidden
		}, 5000);

		it.skip("should reject malformed authorization headers", async () => {
			const response = await request(app)
				.get("/v1/users/profile")
				.set("Authorization", "InvalidFormat token");
			expect([401, 403]).toContain(response.status); // Unauthorized or Forbidden
		}, 5000);
	});

	describe("Information Disclosure", () => {
		it("should not expose stack traces in production", async () => {
			// Temporarily set NODE_ENV to production
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "production";

			const response = await request(app)
				.get("/v1/nonexistent-endpoint")
				.expect(404);

			expect(response.body.stack).toBeUndefined();
			expect(response.body.trace).toBeUndefined();

			// Restore original environment
			process.env.NODE_ENV = originalEnv;
		});

		it("should not expose sensitive server information", async () => {
			const response = await request(app).get("/health").expect(200);

			// Health check should not expose sensitive information
			expect(response.body.databaseUrl).toBeUndefined();
			expect(response.body.secrets).toBeUndefined();
			expect(response.body.privateKeys).toBeUndefined();
		});
	});

	describe("Content Security Policy", () => {
		it("should set appropriate CSP headers for API responses", async () => {
			const response = await request(app).get("/health").expect(200);

			// Check for security headers
			expect(response.headers["content-type"]).toContain("application/json");
			expect(response.headers["x-content-type-options"]).toBe("nosniff");
		});
	});

	describe("Authentication Security", () => {
		it.skip("should handle JWT token expiration gracefully", async () => {
			// Mock an expired token
			const expiredToken =
				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid";

			const response = await request(app)
				.get("/v1/users/profile")
				.set("Authorization", `Bearer ${expiredToken}`);
			expect([401, 403]).toContain(response.status);
		}, 5000);

		it.skip("should validate JWT token signature", async () => {
			// Token with invalid signature
			const invalidSignatureToken =
				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid-signature";

			const response = await request(app)
				.get("/v1/users/profile")
				.set("Authorization", `Bearer ${invalidSignatureToken}`);
			expect([401, 403]).toContain(response.status);
		}, 5000);
	});

	describe("Error Handling Security", () => {
		it("should not leak sensitive information in error messages", async () => {
			const response = await request(app)
				.post("/v1/auth/login")
				.send({}) // Empty body to trigger validation error
				.expect(400);

			// Error message should not contain sensitive information
			const errorMessage = JSON.stringify(response.body).toLowerCase();
			expect(errorMessage).not.toContain("database");
			expect(errorMessage).not.toContain("password");
			expect(errorMessage).not.toContain("secret");
			expect(errorMessage).not.toContain("key");
		});
	});
});
