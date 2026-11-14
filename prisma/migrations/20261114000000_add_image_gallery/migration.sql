-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('Draft', 'Published');

-- CreateTable
CREATE TABLE "image_gallery" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'General',
    "image_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "status" "ImageStatus" NOT NULL DEFAULT 'Draft',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "image_gallery_image_key_key" ON "image_gallery"("image_key");

-- CreateIndex
CREATE INDEX "image_gallery_status_is_active_display_order_idx" ON "image_gallery"("status", "is_active", "display_order");

-- CreateIndex
CREATE INDEX "image_gallery_category_idx" ON "image_gallery"("category");
