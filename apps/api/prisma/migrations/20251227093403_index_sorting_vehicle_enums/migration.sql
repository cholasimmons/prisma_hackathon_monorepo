-- AlterEnum
ALTER TYPE "vehicles"."vehicle_types" ADD VALUE 'hatchback';

-- CreateIndex
CREATE INDEX "logos_name_idx" ON "logos"."logos"("name" ASC);

-- CreateIndex
CREATE INDEX "logos_createdAt_idx" ON "logos"."logos"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "vehicle_photos_createdAt_idx" ON "vehicles"."vehicle_photos"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "vehicle_photos_submittedVehicleId_idx" ON "vehicles"."vehicle_photos"("submittedVehicleId" DESC);

-- CreateIndex
CREATE INDEX "vehicle_photos_vehicleId_idx" ON "vehicles"."vehicle_photos"("vehicleId" DESC);

-- CreateIndex
CREATE INDEX "vehicle_submissions_plate_idx" ON "vehicles"."vehicle_submissions"("plate");

-- CreateIndex
CREATE INDEX "vehicle_submissions_make_idx" ON "vehicles"."vehicle_submissions"("make");

-- CreateIndex
CREATE INDEX "vehicle_submissions_year_idx" ON "vehicles"."vehicle_submissions"("year");

-- CreateIndex
CREATE INDEX "vehicle_submissions_createdAt_idx" ON "vehicles"."vehicle_submissions"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "vehicles_plate_idx" ON "vehicles"."vehicles"("plate" ASC);

-- CreateIndex
CREATE INDEX "vehicles_make_idx" ON "vehicles"."vehicles"("make" ASC);

-- CreateIndex
CREATE INDEX "vehicles_year_idx" ON "vehicles"."vehicles"("year");
