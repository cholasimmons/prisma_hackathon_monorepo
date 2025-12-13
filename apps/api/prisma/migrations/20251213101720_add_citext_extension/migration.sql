CREATE EXTENSION IF NOT EXISTS citext;

/*
  Warnings:

  - You are about to drop the column `submitedById` on the `logos` table. All the data in the column will be lost.
  - Added the required column `submittedById` to the `logos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "logos"."logos" DROP COLUMN "submitedById",
ADD COLUMN     "submittedById" TEXT NOT NULL,
ALTER COLUMN "name" SET DATA TYPE CITEXT;
