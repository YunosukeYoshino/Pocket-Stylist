-- CreateEnum
CREATE TYPE "FileCategory" AS ENUM ('avatar', 'garment', 'tryon', 'other');

-- CreateTable
CREATE TABLE "files" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "category" "FileCategory" NOT NULL,
    "r2_key" VARCHAR(500) NOT NULL,
    "r2_bucket" VARCHAR(100) NOT NULL,
    "cdn_url" TEXT,
    "thumbnail_url" TEXT,
    "metadata" JSONB,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "checksum" VARCHAR(64),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "files_r2_key_key" ON "files"("r2_key");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;