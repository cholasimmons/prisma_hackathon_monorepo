-- CreateEnum
CREATE TYPE "vehicles"."upload_statuses" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "vehicles"."vehicle_photos" ADD COLUMN     "status" "vehicles"."upload_statuses" NOT NULL DEFAULT 'PENDING';
