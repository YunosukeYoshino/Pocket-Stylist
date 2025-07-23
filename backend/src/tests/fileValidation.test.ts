import {
	generateSecureFilename,
	validateFile,
	validateFileContent,
} from "../utils/fileValidation";

describe("File Validation", () => {
	describe("validateFile", () => {
		it("should validate a valid JPEG file", () => {
			const mockFile = {
				name: "test.jpg",
				type: "image/jpeg",
				size: 1024 * 1024, // 1MB
			} as File;

			const result = validateFile(mockFile);

			expect(result.isValid).toBe(true);
			expect(result.fileInfo).toEqual({
				size: 1024 * 1024,
				mimeType: "image/jpeg",
				filename: "test.jpg",
			});
		});

		it("should reject files that are too large", () => {
			const mockFile = {
				name: "test.jpg",
				type: "image/jpeg",
				size: 11 * 1024 * 1024, // 11MB (over limit)
			} as File;

			const result = validateFile(mockFile);

			expect(result.isValid).toBe(false);
			expect(result.error).toContain("File size exceeds maximum limit");
		});

		it("should reject unsupported file types", () => {
			const mockFile = {
				name: "test.gif",
				type: "image/gif",
				size: 1024 * 1024,
			} as File;

			const result = validateFile(mockFile);

			expect(result.isValid).toBe(false);
			expect(result.error).toContain("File type image/gif is not allowed");
		});

		it("should reject files with invalid extensions", () => {
			const mockFile = {
				name: "test.exe",
				type: "image/jpeg",
				size: 1024 * 1024,
			} as File;

			const result = validateFile(mockFile);

			expect(result.isValid).toBe(false);
			expect(result.error).toContain("File extension .exe is not allowed");
		});
	});

	describe("validateFileContent", () => {
		it("should validate JPEG file signature", () => {
			const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
			const buffer = jpegHeader.buffer;

			const result = validateFileContent(buffer);

			expect(result.isValid).toBe(true);
		});

		it("should validate PNG file signature", () => {
			const pngHeader = new Uint8Array([
				0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
			]);
			const buffer = pngHeader.buffer;

			const result = validateFileContent(buffer);

			expect(result.isValid).toBe(true);
		});

		it("should reject invalid file signatures", () => {
			const invalidHeader = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
			const buffer = invalidHeader.buffer;

			const result = validateFileContent(buffer);

			expect(result.isValid).toBe(false);
			expect(result.error).toContain(
				"File content does not match expected image format",
			);
		});
	});

	describe("generateSecureFilename", () => {
		it("should generate secure filename with user ID and timestamp", () => {
			const userId = "user123";
			const originalFilename = "photo.jpg";

			const result = generateSecureFilename(originalFilename, userId);

			expect(result).toMatch(/^user123\/\d+_[a-z0-9]+\.jpg$/);
		});

		it("should handle files without extensions", () => {
			const userId = "user123";
			const originalFilename = "photo";

			const result = generateSecureFilename(originalFilename, userId);

			expect(result).toMatch(/^user123\/\d+_[a-z0-9]+\.unknown$/);
		});

		it("should normalize file extensions to lowercase", () => {
			const userId = "user123";
			const originalFilename = "photo.JPEG";

			const result = generateSecureFilename(originalFilename, userId);

			expect(result).toMatch(/^user123\/\d+_[a-z0-9]+\.jpeg$/);
		});
	});
});
