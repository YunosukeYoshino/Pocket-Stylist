import {
	Prisma,
	PrismaClientKnownRequestError,
	PrismaClientValidationError,
} from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export interface AppError extends Error {
	statusCode?: number;
	isOperational?: boolean;
}

export class ApiError extends Error implements AppError {
	statusCode: number;
	isOperational: boolean;

	constructor(message: string, statusCode = 500, isOperational = true) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = isOperational;

		Error.captureStackTrace(this, this.constructor);
	}
}

export const errorHandler = (
	error: AppError | Error,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	let statusCode = 500;
	let message = "Internal Server Error";
	let details: unknown;

	// Zod validation errors
	if (error instanceof ZodError) {
		statusCode = 400;
		message = "Validation Error";
		details = error.issues.map((err) => ({
			field: err.path.join("."),
			message: err.message,
			code: err.code,
		}));
	}
	// Prisma errors
	else if (error instanceof PrismaClientKnownRequestError) {
		switch (error.code) {
			case "P2002":
				statusCode = 409;
				message = "Unique constraint violation";
				details = { field: error.meta?.target };
				break;
			case "P2025":
				statusCode = 404;
				message = "Record not found";
				break;
			case "P2003":
				statusCode = 400;
				message = "Foreign key constraint failed";
				break;
			default:
				statusCode = 400;
				message = "Database operation failed";
		}
	}
	// Prisma validation errors
	else if (error instanceof PrismaClientValidationError) {
		statusCode = 400;
		message = "Invalid data provided";
	}
	// Custom API errors
	else if (error instanceof ApiError) {
		statusCode = error.statusCode;
		message = error.message;
	}
	// General errors
	else if (error instanceof Error) {
		message = error.message;
		if ("statusCode" in error && typeof error.statusCode === "number") {
			statusCode = error.statusCode;
		}
	}

	// ログ出力
	console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
		error: error.message,
		stack: error.stack,
		statusCode,
		userId: req.user?.sub,
	});

	// レスポンス
	const response: Record<string, unknown> = {
		error: message,
		statusCode,
		timestamp: new Date().toISOString(),
		path: req.path,
	};

	if (details) {
		response.details = details;
	}

	// 開発環境でのみスタックトレースを含める
	if (process.env.NODE_ENV === "development") {
		response.stack = error.stack;
	}

	res.status(statusCode).json(response);
};

type AsyncRequestHandler = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<void>;

export const asyncHandler = (fn: AsyncRequestHandler) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};
