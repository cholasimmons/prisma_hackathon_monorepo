import { User, Vehicle, VehicleSubmission } from "@generated/prisma/client";

const PublicUserFields = [
  "id",
  "name",
  "email",
  "emailVerified",
  "image",
  "createdAt",
  "updatedAt",
  "role",
  "banned",
  "banReason",
  "banExpires"
] as const;

type PublicUser = Pick<User, (typeof PublicUserFields)[number]>;

export { PublicUserFields };
export type { PublicUser };
