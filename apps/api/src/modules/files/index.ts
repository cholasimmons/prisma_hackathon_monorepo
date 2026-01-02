import { Elysia, redirect, t } from "elysia";
import s3 from "~utils/s3"; // Import your configured client

const fileController = new Elysia({
  prefix: "/files",
})

  .get(
    "/file/:key",
    async ({ status, set, redirect, params: { key } }) => {
      // Generate a URL that is valid for 1 hour (3600 seconds)[citation:1]
      const url = s3.presign(key, {
        expiresIn: 3600,
        // This generates a GET URL for downloading/viewing[citation:7]
        method: "GET",
      });

      // Redirect the user to the temporary MinIO URL
      status(302);
      set.headers["Location"] = url;
      return redirect(url);
    },
    {
      params: t.Object({
        key: t.String(),
      }),
    },
  )

  .post(
    "/upload",
    async ({ body }) => {
      // Assume the form has a field named 'image'
      const file = body.image as File;

      // Create a unique filename
      const fileName = `uploads/${Date.now()}-${file.name}`;
      const s3File = s3.file(fileName);

      // Upload the file to MinIO
      // You can specify content type, e.g., 'image/jpeg'
      await s3File.write(file, {
        type: file.type,
      });

      // Return the file path/key for future reference
      return {
        success: true,
        data: {
          key: fileName,
        },
      };
    },
    {
      body: t.Object({
        image: t.File({ format: "image/*" }),
      }),
    },
  )

  .get("/s3-test", async ({ status }) => {
    // Test S3 connection
    const file = s3.file("test.txt");
    const exists = await file.exists();

    status(200);
    return { s3Connected: exists, bucket: process.env.S3_BUCKET };
  });

export default fileController;
