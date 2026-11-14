-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('Draft', 'Published');

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "video_key" TEXT NOT NULL,
    "video_mime_type" TEXT NOT NULL,
    "video_size" BIGINT NOT NULL,
    "thumbnail_key" TEXT,
    "thumbnail_mime_type" TEXT,
    "duration_seconds" INTEGER,
    "status" "VideoStatus" NOT NULL DEFAULT 'Draft',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "videos_video_key_key" ON "videos"("video_key");

-- CreateIndex
CREATE UNIQUE INDEX "videos_thumbnail_key_key" ON "videos"("thumbnail_key");

-- CreateIndex
CREATE INDEX "videos_status_display_order_idx" ON "videos"("status", "display_order");

-- CreateIndex
CREATE INDEX "videos_category_idx" ON "videos"("category");
