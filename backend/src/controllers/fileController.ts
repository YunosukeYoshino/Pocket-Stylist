import type { Context } from "hono";
import { z } from "zod";
import type { AuthContext, Env } from "../index";
import { FileService } from "../services/fileService";
import { getPrismaClient } from "../utils/database";

const CategorySchema = z.enum(["avatar", "garment", "tryon", "other"]);

const UploadBodySchema = z.object({
	file: z.instanceof(File),
	category: CategorySchema,
});

export class FileController {
	private fileService: FileService;

	constructor(env: Env) {
		const prisma = getPrismaClient(env.DATABASE_URL);
		this.fileService = new FileService(prisma, env);
	}

	async uploadFile(c: Context<{ Bindings: Env; Variables: AuthContext }>) {
		try {
			const user = c.get("user");
			if (!user?.sub) {
				return c.json({ error: "User not authenticated" }, 401);
			}

			const body = await c.req.parseBody();

			const validationResult = UploadBodySchema.safeParse(body);
			if (!validationResult.success) {
				return c.json(
					{
						error: "Invalid request body",
						details: validationResult.error.format(),
					},
					400,
				);
			}

			const { file, category } = validationResult.data;

			const result = await this.fileService.uploadFile(
				file,
				user.sub,
				category,
			);

			return c.json({
				success: true,
				data: result,
			});
		} catch (error) {
			console.error("Upload error:", error);
			return c.json(
				{ error: error instanceof Error ? error.message : "Upload failed" },
				500,
			);
		}
	}

	async getFile(c: Context<{ Bindings: Env; Variables: AuthContext }>) {
		try {
			const user = c.get("user");
			if (!user?.sub) {
				return c.json({ error: "User not authenticated" }, 401);
			}

			const fileId = c.req.param("id");
			if (!fileId) {
				return c.json({ error: "File ID is required" }, 400);
			}

			const file = await this.fileService.getFile(fileId, user.sub);

			if (!file) {
				return c.json({ error: "File not found" }, 404);
			}

			return c.json({
				success: true,
				data: file,
			});
		} catch (error) {
			console.error("Get file error:", error);
			return c.json(
				{
					error: error instanceof Error ? error.message : "Failed to get file",
				},
				500,
			);
		}
	}

	async deleteFile(c: Context<{ Bindings: Env; Variables: AuthContext }>) {
		try {
			const user = c.get("user");
			if (!user?.sub) {
				return c.json({ error: "User not authenticated" }, 401);
			}

			const fileId = c.req.param("id");
			if (!fileId) {
				return c.json({ error: "File ID is required" }, 400);
			}

			const success = await this.fileService.deleteFile(fileId, user.sub);

			if (!success) {
				return c.json({ error: "File not found or could not be deleted" }, 404);
			}

			return c.json({
				success: true,
				message: "File deleted successfully",
			});
		} catch (error) {
			console.error("Delete file error:", error);
			return c.json(
				{
					error:
						error instanceof Error ? error.message : "Failed to delete file",
				},
				500,
			);
		}
	}

	async getUserFiles(c: Context<{ Bindings: Env; Variables: AuthContext }>) {
		try {
			const user = c.get("user");
			if (!user?.sub) {
				return c.json({ error: "User not authenticated" }, 401);
			}

			const category = c.req.query("category") as
				| "avatar"
				| "garment"
				| "tryon"
				| "other"
				| undefined;
			const page = Math.max(
				1,
				Number.parseInt(c.req.query("page") || "1", 10) || 1,
			);
			const limit = Math.min(
				100,
				Math.max(1, Number.parseInt(c.req.query("limit") || "20", 10) || 20),
			);

			const result = await this.fileService.getUserFiles(
				user.sub,
				category,
				page,
				limit,
			);

			return c.json({
				success: true,
				data: result.files,
				pagination: result.pagination,
			});
		} catch (error) {
			console.error("Get user files error:", error);
			return c.json(
				{
					error: error instanceof Error ? error.message : "Failed to get files",
				},
				500,
			);
		}
	}
}
