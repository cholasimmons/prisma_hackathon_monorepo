import { PUBLIC_S3_ENDPOINT, PUBLIC_S3_BUCKET } from '$env/static/public';

export function load({ locals }) {
  return {
    user: locals.user ?? null,
    session: locals.session ?? null,
    apiDown: locals.apiDown ?? false,
    s3Endpoint: PUBLIC_S3_ENDPOINT,
    s3Bucket: PUBLIC_S3_BUCKET
  };
};