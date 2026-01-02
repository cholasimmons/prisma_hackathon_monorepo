-- AlterEnum
ALTER TYPE "vehicles"."vehicle_types" ADD VALUE 'offroad';

-- AlterTable
ALTER TABLE "vehicles"."vehicle_photos" ALTER COLUMN "url" DROP NOT NULL;
