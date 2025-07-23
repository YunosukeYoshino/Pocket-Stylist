import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { NextFunction, Request, Response } from "express";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

export class AppError extends Error {
	statusCode: number;
	isOperational: boolean;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

export class ClaudeAPIError extends AppError {
	constructor(message: string, statusCode = 500) {
		super(`Claude API Error: ${message}`, statusCode);
	}
}

export class RecommendationError extends AppError {
	constructor(message: string, statusCode = 500) {
		super(`Recommendation Error: ${message}`, statusCode);
	}
}

export const errorHandler = (
	error: Error,
	req: Request,
	res: Response,
	_next: NextFunction,
): void => {
	let statusCode = 500;
	let message = "Internal Server Error";

	// Log error details
	console.error("Error caught by error handler:", {
		message: error.message,
		stack: error.stack,
		url: req.url,
		method: req.method,
		ip: req.ip,
		userAgent: req.get("User-Agent"),
	});

	// Handle different types of errors
	if (error instanceof AppError) {
		statusCode = error.statusCode;
		message = error.message;
	} else if (error instanceof ZodError) {
		statusCode = 400;
		message = "Validation Error";
		const validationErrors = error.errors.map((err) => ({
			field: err.path.join("."),
			message: err.message,
		}));

		res.status(statusCode).json({
			error: message,
			details: validationErrors,
		});
		return;
	} else if (error instanceof PrismaClientKnownRequestError) {
		statusCode = 400;

		switch (error.code) {
			case "P2002":
				message = "Unique constraint violation";
				break;
			case "P2025":
				message = "Record not found";
				statusCode = 404;
				break;
			case "P2003":
				message = "Foreign key constraint violation";
				break;
			case "P2014":
				message = "Invalid ID provided";
				break;
			default:
				message = "Database error";
		}
	} else if (error.name === "JsonWebTokenError") {
		statusCode = 401;
		message = "Invalid token";
	} else if (error.name === "TokenExpiredError") {
		statusCode = 401;
		message = "Token expired";
	} else if (error.name === "NotBeforeError") {
		statusCode = 401;
		message = "Token not active";
	}

	// Send error response
	res.status(statusCode).json({
		error: message,
		...(process.env.NODE_ENV === "development" && {
			details: error.message,
			stack: error.stack,
		}),
	});
};

export const asyncHandler = (
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
	const error = new AppError(`Not found - ${req.originalUrl}`, 404);
	next(error);
};

// Hono error handling using onError pattern
export const honoErrorMiddleware = (error: Error, c: Context) => {
	let statusCode = 500;
	let message = "Internal Server Error";
	let details: Array<{ field: string; message: string }> | undefined;

	// Filter out sensitive headers
	const sensitiveHeaders = [
		"authorization",
		"cookie",
		"x-api-key",
		"x-auth-token",
	];
	const sanitizedHeaders = Object.fromEntries(
		Object.entries(c.req.header()).filter(
			([key]) => !sensitiveHeaders.includes(key.toLowerCase()),
		),
	);

	// Log error details
	console.error("Error caught by Hono error handler:", {
		message: error.message,
		stack: error.stack,
		url: c.req.url,
		method: c.req.method,
		headers: sanitizedHeaders,
		timestamp: new Date().toISOString(),
	});

	// Handle different types of errors
	if (error instanceof HTTPException) {
		statusCode = error.status;
		message = error.message;
	} else if (error instanceof AppError) {
		statusCode = error.statusCode;
		message = error.message;
	} else if (error instanceof ZodError) {
		statusCode = 400;
		message = "Validation Error";
		details = error.errors.map((err) => ({
			field: err.path.join("."),
			message: err.message,
		}));
	} else if (error instanceof PrismaClientKnownRequestError) {
		statusCode = 400;

		switch (error.code) {
			case "P2002":
				message = "Unique constraint violation";
				break;
			case "P2025":
				message = "Record not found";
				statusCode = 404;
				break;
			case "P2003":
				message = "Foreign key constraint violation";
				break;
			case "P2014":
				message = "Invalid ID provided";
				break;
			default:
				message = "Database error";
		}
	} else if (error.name === "JsonWebTokenError") {
		statusCode = 401;
		message = "Invalid token";
	} else if (error.name === "TokenExpiredError") {
		statusCode = 401;
		message = "Token expired";
	} else if (error.name === "NotBeforeError") {
		statusCode = 401;
		message = "Token not active";
	}

	// Build response object
	const responseBody: {
		error: string;
		details?: Array<{ field: string; message: string }>;
		debug?: { message: string; stack?: string };
	} = { error: message };

	if (details) {
		responseBody.details = details;
	}

	// Include debug info in development
	if (process.env.NODE_ENV === "development") {
		responseBody.debug = {
			message: error.message,
			stack: error.stack,
		};
	}

	return c.json(responseBody, statusCode);
};
