import { S3Client } from "bun";

const s3 = new S3Client({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  bucket: process.env.PUBLIC_S3_BUCKET,
  // sessionToken: "..."
  acl: "public-read",
  // endpoint: "https://s3.us-east-1.amazonaws.com",
  // endpoint: "https://<account-id>.r2.cloudflarestorage.com", // Cloudflare R2
  // endpoint: "https://<region>.digitaloceanspaces.com", // DigitalOcean Spaces
  endpoint: process.env.PUBLIC_S3_ENDPOINT, // MinIO
  region: process.env.PUBLIC_S3_REGION || "us-east-1",
});

// Bun.s3 is a global singleton that is equivalent to `new Bun.S3Client()`
export default s3;
