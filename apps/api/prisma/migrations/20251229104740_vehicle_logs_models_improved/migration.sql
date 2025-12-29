/*
  Warnings:

  - Made the column `make` on table `vehicle_submissions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "vehicles"."vehicle_submissions_createdAt_idx";

-- DropIndex
DROP INDEX "vehicles"."vehicle_submissions_year_idx";

-- DropIndex
DROP INDEX "vehicles"."vehicles_year_idx";

-- AlterTable
ALTER TABLE "vehicles"."vehicle_submissions" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "make" SET NOT NULL;

-- AlterTable
ALTER TABLE "vehicles"."vehicles" ADD COLUMN     "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "submissionCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "vehicle_submissions_createdAt_idx" ON "vehicles"."vehicle_submissions"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "vehicles_createdAt_idx" ON "vehicles"."vehicles"("createdAt" ASC);
