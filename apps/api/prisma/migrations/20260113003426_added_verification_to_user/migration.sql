-- AlterTable
ALTER TABLE "auth"."user" ADD COLUMN     "activationEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "verifiedAt" TIMESTAMP(3);
