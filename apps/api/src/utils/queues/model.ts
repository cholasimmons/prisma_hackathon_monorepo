interface QueueEmail {
  to: string,
  subject: string,
  html: string,
}

interface QueueImage {
  userId: string,
  file: File,
  filepath: string,
  ext?: string,
}

export type { QueueEmail, QueueImage }