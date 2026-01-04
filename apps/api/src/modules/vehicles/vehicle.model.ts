import { Vehicle, VehicleSubmission } from "@generated/prisma/client";

type FieldConsensus<T> = {
  value: T | null;
  confidence: number; // 0 → 1
  votes: number;
};

type ConsensusResult = {
  plate: string;
  totalSubmissions: number;
  fields: {
    make: FieldConsensus<string>;
    model: FieldConsensus<string | null>;
    year: FieldConsensus<number | null>;
    color: FieldConsensus<string>;
    type: FieldConsensus<string | null>;
    forSale: FieldConsensus<boolean | null>;
  };
};

const PublicVehicleFields = [
  "id",
  "plate",
  "make",
  "model",
  "color",
  "year",
  "forSale",
  "type",
  "createdAt",
  "updatedAt",
] as const;
const PublicVehicleSubmissionFields = [
  "id",
  "plate",
  "make",
  "model",
  "color",
  "year",
  "forSale",
  "type",
  "createdAt",
  "updatedAt",
] as const;

type PublicVehicle = Pick<Vehicle, (typeof PublicVehicleFields)[number]>;
type PublicVehicleSubmission = Pick<
  VehicleSubmission,
  (typeof PublicVehicleSubmissionFields)[number]
>;

export { PublicVehicleFields, PublicVehicleSubmissionFields };
export type { FieldConsensus, ConsensusResult, PublicVehicle, PublicVehicleSubmission };
