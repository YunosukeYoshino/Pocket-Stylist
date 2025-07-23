import type { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import type { Env } from "../index";
import {
	generateSecureFilename,
	validateFile,
	validateFileContent,
} from "../utils/fileValidation";
import { ImageService } from "./imageService";
import { R2Service } from "./r2Service";

export interface FileMetadata {
	variants?: Record<string, string>;
	imageId?: string;
}

export interface FileUploadResult {
	id: string;
	filename: string;
	originalName: string;
	mimeType: string;
	size: number;
	category: string;
	cdnUrl: string;
	thumbnailUrl?: string;
	variants?: Record<string, string>;
	processed: boolean;
	createdAt: Date;
}

export class FileService {
	private prisma: PrismaClient;
	private r2Service: R2Service;
	private imageService: ImageService;

	constructor(prisma: PrismaClient, env: Env) {
		this.prisma = prisma;
		this.r2Service = new R2Service(env);
		this.imageService = new ImageService(env);
	}

	async uploadFile(
		file: File,
		userId: string,
		category: "avatar" | "garment" | "tryon" | "other",
	): Promise<FileUploadResult> {
		// Validate file
		const validation = validateFile(file);
		if (!validation.isValid) {
			throw new Error(validation.error);
		}

		// Get file buffer
		const fileBuffer = await file.arrayBuffer();

		// Validate file content
		const contentValidation = validateFileContent(fileBuffer);
		if (!contentValidation.isValid) {
			throw new Error(contentValidation.error);
		}

		// Generate secure filename
		const secureFilename = generateSecureFilename(file.name, userId);
		const fileId = uuidv4();

		// Calculate checksum
		const checksum = await this.calculateChecksum(fileBuffer);

		// Upload to R2
		const cdnUrl = await this.r2Service.uploadFile(
			secureFilename,
			fileBuffer,
			file.type,
			{
				userId,
				category,
				originalName: file.name,
				fileId,
			},
		);

		// Process image variants if it's an image
		let variants: Record<string, string> = {};
		let thumbnailUrl: string | undefined;
		let processed = false;
		let imageId: string | undefined;

		if (file.type.startsWith("image/")) {
			try {
				const imageProcessing = await this.imageService.processImageVariants(
					fileBuffer,
					secureFilename,
					{
						userId,
						category,
						originalName: file.name,
						fileId,
					},
				);

				variants = imageProcessing.variants;
				thumbnailUrl = variants.thumbnail;
				imageId = imageProcessing.imageId;
				processed = true;
			} catch (error) {
				console.error("Error processing image variants:", error);
				// Continue without variants if processing fails
			}
		}

		// Save to database
		const fileRecord = await this.prisma.file.create({
			data: {
				id: fileId,
				userId,
				filename: secureFilename,
				originalName: file.name,
				mimeType: file.type,
				size: file.size,
				category,
				r2Key: secureFilename,
				r2Bucket: this.r2Service.bucketName,
				cdnUrl,
				thumbnailUrl,
				metadata: {
					variants,
					imageId,
				},
				processed,
				checksum,
			},
		});

		return {
			id: fileRecord.id,
			filename: fileRecord.filename,
			originalName: fileRecord.originalName,
			mimeType: fileRecord.mimeType,
			size: fileRecord.size,
			category: fileRecord.category,
			cdnUrl: fileRecord.cdnUrl || "",
			thumbnailUrl: fileRecord.thumbnailUrl,
			variants,
			processed: fileRecord.processed,
			createdAt: fileRecord.createdAt,
		};
	}

	async getFile(
		fileId: string,
		userId: string,
	): Promise<FileUploadResult | null> {
		const file = await this.prisma.file.findFirst({
			where: {
				id: fileId,
				userId,
			},
		});

		if (!file) {
			return null;
		}

		return {
			id: file.id,
			filename: file.filename,
			originalName: file.originalName,
			mimeType: file.mimeType,
			size: file.size,
			category: file.category,
			cdnUrl: file.cdnUrl || "",
			thumbnailUrl: file.thumbnailUrl,
			variants: (file.metadata as FileMetadata)?.variants || {},
			processed: file.processed,
			createdAt: file.createdAt,
		};
	}

	async deleteFile(fileId: string, userId: string): Promise<boolean> {
		const file = await this.prisma.file.findFirst({
			where: {
				id: fileId,
				userId,
			},
		});

		if (!file) {
			return false;
		}

		try {
			// Delete from R2
			await this.r2Service.deleteFile(file.r2Key);

			// Delete from Cloudflare Images if it was processed
			if (file.processed && file.mimeType.startsWith("image/")) {
				const imageId = (file.metadata as FileMetadata)?.imageId;
				if (imageId) {
					await this.imageService.deleteImage(imageId);
				}
			}

			// Delete from database
			await this.prisma.file.delete({
				where: {
					id: fileId,
				},
			});

			return true;
		} catch (error) {
			console.error("Error deleting file:", error);
			return false;
		}
	}

	async getUserFiles(
		userId: string,
		category?: "avatar" | "garment" | "tryon" | "other",
		page = 1,
		limit = 20,
	): Promise<{
		files: FileUploadResult[];
		pagination: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	}> {
		const where = {
			userId,
			...(category && { category }),
		};

		const [files, total] = await Promise.all([
			this.prisma.file.findMany({
				where,
				orderBy: {
					createdAt: "desc",
				},
				skip: (page - 1) * limit,
				take: limit,
			}),
			this.prisma.file.count({ where }),
		]);

		const fileResults = files.map((file: any) => ({
			id: file.id,
			filename: file.filename,
			originalName: file.originalName,
			mimeType: file.mimeType,
			size: file.size,
			category: file.category,
			cdnUrl: file.cdnUrl || "",
			thumbnailUrl: file.thumbnailUrl,
			variants: (file.metadata as FileMetadata)?.variants || {},
			processed: file.processed,
			createdAt: file.createdAt,
		}));

		return {
			files: fileResults,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	private async calculateChecksum(buffer: ArrayBuffer): Promise<string> {
		const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	}
}
