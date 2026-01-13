import { VehicleSubmission } from "@generated/prisma/client";
import { t } from "elysia";

interface QueueEmail {
  to: string,
  subject: string,
  html: string,
}
const QueueEmailSchema = t.Object({
  to: t.String({ format: "email" }),
  subject: t.String({ minLength: 24, maxLength: 100 }),
  html: t.String({ minLength: 1 })
})


interface QueueImage {
  userId: string,
  // file: File,
  tempPath: string,
  filepath: string,
  ext?: string,
}

interface QueueSubmission {
  userId: string,
  submittedVehiclePlate: string,
}

interface QueueSubmissionPhotos {
  photoId: string, submissionId: string, tempPath: string, filepath: string, ext?: string
}

export type { QueueEmail, QueueImage, QueueSubmission, QueueSubmissionPhotos }
export type QEmail = typeof QueueEmailSchema.static