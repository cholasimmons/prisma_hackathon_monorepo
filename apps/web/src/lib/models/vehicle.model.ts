import type { VehiclePhoto } from './photo.model';
import type { UserProfile } from './user.model';

interface Vehicle {
	id: string;
	plate: string;
	make: string;
	model?: string | null;
	photos?: VehiclePhoto[] | null;
	color: string;
	year?: number | null;
	type?: string | null;
	submissionCount: number;
	confidence: number;
	forSale: boolean | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt?: Date;
}

interface VehicleSubmission {
	id: string;
	plate: string;
	make: string;
	model?: string | null;
	photos?: VehiclePhoto[] | null;
	color: string;
	year?: number | null;
	type?: string | null;
	forSale?: boolean | null;

  submittedById: string;
  submittedBy?: UserProfile | null;
  createdAt: Date;
  updatedAt?: Date;
}

export enum VehicleType {
	PICKUP = 'pickup',
	TRUCK = 'truck',
	MOTORBIKE = 'motorbike',
	QUADBIKE = 'quadbike',
	SEMI = 'semi',
	TRAILER = 'trailer',
	SUV = 'suv',
	VAN = 'van',
	BUS = 'bus',
	SEDAN = 'sedan',
	LIMOUSINE = 'limousine',
	CONVERTIBLE = 'convertible',
	COUPE = 'coupe',
	HATCHBACK = 'hatchback',
}
// Helpful for UI iteration
export const VEHICLE_TYPE_VALUES = Object.values(VehicleType);

// Search response shape (recommended for backend to return this)
interface VehicleSearchResult {
	vehicles: Vehicle[];
	// Later: submissions?: VehicleSubmission[]; // if needed
}

export type { Vehicle, VehicleSubmission, VehicleSearchResult };
