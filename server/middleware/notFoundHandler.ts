import type { Request, Response } from "express";

export const notFoundHandler = (req: Request, res: Response) => {
	res.status(404).json({
		error: "Not Found",
		message: `Route ${req.method} ${req.path} not found`,
		statusCode: 404,
		timestamp: new Date().toISOString(),
	});
};
