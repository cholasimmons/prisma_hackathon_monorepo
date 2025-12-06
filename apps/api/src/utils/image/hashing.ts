import sharp from "sharp";
import { promisify } from "node:util";
import { imageHash } from "image-hash";

async function processImage(file: Buffer) {
  // normalize + get metadata
  const s = sharp(file).rotate();

  const metadata = await s.metadata();

  // resized for hashing
  const resized = await s
    .resize(256, 256, { fit: "cover" })
    .greyscale()
    // .raw()
    .toBuffer();

  // blockhash (pHash)
  // const hash = blockhash(
  //   resized,
  //   256,
  //   2, // bits per channel
  // );

  const pHash = await getPHashFromBuffer(resized);

  return {
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    pHash,
  };
}

function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return Infinity;
  let d = 0;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) d++;
  }

  return d;
}

const hashAsync = promisify(imageHash);

async function getPHashFromBuffer(buffer: Buffer) {
  return await hashAsync(
    { data: buffer, dataType: "buffer" },
    16, // hash size
    "phash", // or 'ahash' / 'dhash'
  );
}

export { processImage, hammingDistance, getPHashFromBuffer };
