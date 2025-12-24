/*
  Warnings:

  - You are about to drop the column `eventType` on the `audit_events` table. All the data in the column will be lost.
  - Added the required column `type` to the `audit_events` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "logs"."event_types" AS ENUM ('AUTH_REGISTER', 'AUTH_LOGIN', 'AUTH_LOGOUT', 'AUTH_PASSWORD_RESET', 'AUTH_PASSWORD_INCORRECT', 'VEHICLE_CREATE', 'VEHICLE_READ', 'VEHICLE_UPDATE', 'VEHICLE_APPROVE', 'VEHICLE_DELETE', 'SUBMISSION_CREATE', 'SUBMISSION_READ', 'SUBMISSION_UPDATE', 'SUBMISSION_APPROVE', 'SUBMISSION_DELETE', 'USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DELETE', 'USER_BAN', 'USER_SUSPEND', 'PERMISSION_DENIED', 'RATE_LIMIT', 'SYSTEM_ERROR');

-- AlterTable
ALTER TABLE "logs"."audit_events" DROP COLUMN "eventType",
ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "method" TEXT,
ADD COLUMN     "route" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "audit_events_type_idx" ON "logs"."audit_events"("type");

-- CreateIndex
CREATE INDEX "audit_events_actorId_idx" ON "logs"."audit_events"("actorId");

-- CreateIndex
CREATE INDEX "audit_events_createdAt_idx" ON "logs"."audit_events"("createdAt");
