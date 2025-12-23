/*
  Warnings:

  - You are about to drop the column `photo` on the `vehicle_photos` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `vehicle_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `pHash` on the `vehicle_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `vehicle_submissions` table. All the data in the column will be lost.
  - Added the required column `url` to the `vehicle_photos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "vehicles"."vehicle_types" AS ENUM ('pickup', 'truck', 'motorbike', 'quadbike', 'semi', 'trailer', 'suv', 'van', 'bus', 'sedan', 'coupe', 'limousine', 'convertible');

-- AlterTable
ALTER TABLE "vehicles"."vehicle_photos" DROP COLUMN "photo",
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "pHash" TEXT,
ADD COLUMN     "uploadSizeKb" INTEGER,
ADD COLUMN     "url" TEXT NOT NULL,
ADD COLUMN     "width" INTEGER,
ALTER COLUMN "vehicleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "vehicles"."vehicle_submissions" DROP COLUMN "height",
DROP COLUMN "pHash",
DROP COLUMN "width",
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "vehicles"."vehicles" ADD COLUMN     "type" TEXT,
ALTER COLUMN "plate" SET DATA TYPE CITEXT;
