import { Vehicle, VehicleSubmission } from "@/generated/prisma/client";

const PublicVehicleFields = [
  "id",
  "plate",
  "make",
  "model",
  "color",
  "year",
] as const;
const PublicVehicleSubmissionFields = [
  "id",
  "plate",
  "make",
  "model",
  "color",
  "year",
  "createdAt",
  "updatedAt",
] as const;

type PublicVehicle = Pick<Vehicle, (typeof PublicVehicleFields)[number]>;
type PublicVehicleSubmission = Pick<
  VehicleSubmission,
  (typeof PublicVehicleSubmissionFields)[number]
>;

export { PublicVehicleFields, PublicVehicleSubmissionFields };
export type { PublicVehicle, PublicVehicleSubmission };
