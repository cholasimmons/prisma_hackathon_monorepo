/*
  Warnings:

  - You are about to drop the column `photo` on the `vehicles` table. All the data in the column will be lost.
  - Added the required column `submittedVehicleId` to the `vehicle_photos` table without a default value. This is not possible if the table is not empty.
  - Made the column `photo` on table `vehicle_photos` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "logos";

-- DropForeignKey
ALTER TABLE "vehicles"."vehicle_photos" DROP CONSTRAINT "vehicle_photos_vehicleId_fkey";

-- AlterTable
ALTER TABLE "vehicles"."vehicle_photos" ADD COLUMN     "submittedVehicleId" TEXT NOT NULL,
ALTER COLUMN "photo" SET NOT NULL;

-- AlterTable
ALTER TABLE "vehicles"."vehicle_submissions" ADD COLUMN     "forSale" BOOLEAN;

-- AlterTable
ALTER TABLE "vehicles"."vehicles" DROP COLUMN "photo",
ADD COLUMN     "forSale" BOOLEAN;

-- CreateTable
CREATE TABLE "logos"."logos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadSizeKb" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "submitedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "logos_name_key" ON "logos"."logos"("name");

-- AddForeignKey
ALTER TABLE "vehicles"."vehicle_photos" ADD CONSTRAINT "vehicle_photos_submittedVehicleId_fkey" FOREIGN KEY ("submittedVehicleId") REFERENCES "vehicles"."vehicle_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles"."vehicle_photos" ADD CONSTRAINT "vehicle_photos_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
