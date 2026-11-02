-- CreateEnum
CREATE TYPE "ScreenStatus" AS ENUM ('UNPAIRED', 'PAIRED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "Screen" (
    "id" UUID NOT NULL,
    "customName" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "status" "ScreenStatus" NOT NULL DEFAULT 'UNPAIRED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Screen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PairingCode" (
    "id" UUID NOT NULL,
    "codeHash" TEXT NOT NULL,
    "codeSuffix" TEXT NOT NULL,
    "screenId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PairingCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AndroidDevice" (
    "id" UUID NOT NULL,
    "deviceIdentifier" TEXT NOT NULL,
    "deviceName" TEXT,
    "deviceModel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AndroidDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreenPairing" (
    "id" UUID NOT NULL,
    "screenId" UUID NOT NULL,
    "androidDeviceId" UUID NOT NULL,
    "pairedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unpairedAt" TIMESTAMP(3),

    CONSTRAINT "ScreenPairing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" UUID NOT NULL,
    "title" TEXT,
    "message" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentAsset" (
    "id" UUID NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "fileName" TEXT,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" BIGINT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "contentId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentAssignment" (
    "id" UUID NOT NULL,
    "contentId" UUID NOT NULL,
    "screenId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),

    CONSTRAINT "ContentAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallpaper" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallpaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WallpaperAssignment" (
    "id" UUID NOT NULL,
    "screenId" UUID NOT NULL,
    "wallpaperId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "WallpaperAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityImage" (
    "id" UUID NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Screen_status_idx" ON "Screen"("status");

-- CreateIndex
CREATE INDEX "Screen_city_state_country_idx" ON "Screen"("city", "state", "country");

-- CreateIndex
CREATE UNIQUE INDEX "PairingCode_codeHash_key" ON "PairingCode"("codeHash");

-- CreateIndex
CREATE INDEX "PairingCode_screenId_idx" ON "PairingCode"("screenId");

-- CreateIndex
CREATE INDEX "PairingCode_expiresAt_idx" ON "PairingCode"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AndroidDevice_deviceIdentifier_key" ON "AndroidDevice"("deviceIdentifier");

-- CreateIndex
CREATE INDEX "ScreenPairing_screenId_unpairedAt_idx" ON "ScreenPairing"("screenId", "unpairedAt");

-- CreateIndex
CREATE INDEX "ScreenPairing_androidDeviceId_unpairedAt_idx" ON "ScreenPairing"("androidDeviceId", "unpairedAt");

-- CreateIndex
CREATE INDEX "Content_status_idx" ON "Content"("status");

-- CreateIndex
CREATE INDEX "ContentAsset_contentId_idx" ON "ContentAsset"("contentId");

-- CreateIndex
CREATE INDEX "ContentAssignment_screenId_unassignedAt_idx" ON "ContentAssignment"("screenId", "unassignedAt");

-- CreateIndex
CREATE INDEX "ContentAssignment_contentId_idx" ON "ContentAssignment"("contentId");

-- CreateIndex
CREATE INDEX "WallpaperAssignment_screenId_removedAt_idx" ON "WallpaperAssignment"("screenId", "removedAt");

-- CreateIndex
CREATE INDEX "WallpaperAssignment_wallpaperId_idx" ON "WallpaperAssignment"("wallpaperId");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityCategory_name_key" ON "FacilityCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityCategory_slug_key" ON "FacilityCategory"("slug");

-- CreateIndex
CREATE INDEX "FacilityImage_categoryId_idx" ON "FacilityImage"("categoryId");

-- AddForeignKey
ALTER TABLE "PairingCode" ADD CONSTRAINT "PairingCode_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "Screen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreenPairing" ADD CONSTRAINT "ScreenPairing_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "Screen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreenPairing" ADD CONSTRAINT "ScreenPairing_androidDeviceId_fkey" FOREIGN KEY ("androidDeviceId") REFERENCES "AndroidDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAsset" ADD CONSTRAINT "ContentAsset_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAssignment" ADD CONSTRAINT "ContentAssignment_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAssignment" ADD CONSTRAINT "ContentAssignment_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "Screen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WallpaperAssignment" ADD CONSTRAINT "WallpaperAssignment_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "Screen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WallpaperAssignment" ADD CONSTRAINT "WallpaperAssignment_wallpaperId_fkey" FOREIGN KEY ("wallpaperId") REFERENCES "Wallpaper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityImage" ADD CONSTRAINT "FacilityImage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FacilityCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
