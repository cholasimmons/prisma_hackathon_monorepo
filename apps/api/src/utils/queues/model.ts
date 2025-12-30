import { VehicleSubmission } from "@/generated/prisma/client";

interface QueueEmail {
  to: string,
  subject: string,
  html: string,
}

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
  userId: string,
  submittedVehiclePhotoId: string,
  file: File
}

export type { QueueEmail, QueueImage, QueueSubmission, QueueSubmissionPhotos }