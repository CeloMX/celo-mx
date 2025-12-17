-- AlterTable: MerchItem
-- Add images array and video field to support product carousel

-- Add images column (array of strings, default empty array)
ALTER TABLE "MerchItem" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add video column (optional string)
ALTER TABLE "MerchItem" ADD COLUMN IF NOT EXISTS "video" TEXT;

