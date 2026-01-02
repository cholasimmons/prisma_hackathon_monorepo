import { Logo } from "@generated/prisma/client";

const PublicLogoFields = ["id", "name", "url", "uploadSizeKb"] as const;

type PublicLogo = Pick<Logo, (typeof PublicLogoFields)[number]>;

export { PublicLogoFields };
export type { PublicLogo };
