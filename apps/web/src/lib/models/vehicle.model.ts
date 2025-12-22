import type { VehiclePhoto } from './photo.model';

interface Vehicle {
	id: string;
	plate: string;
	make: string;
	model?: string | null;
	photos?: VehiclePhoto[] | null;
	color: string;
	year?: number | null;
	forSale: boolean | null;
	updateAt?: Date;
}

interface VehicleSubmission {
	id: string;
	plate: string;
	make: string;
	model?: string | null;
	photos?: VehiclePhoto[] | null;
	color: string;
	year?: number | null;
	forSale?: boolean | null;
}

// Search response shape (recommended for backend to return this)
interface VehicleSearchResult {
	vehicles: Vehicle[];
	// Later: submissions?: VehicleSubmission[]; // if needed
}

export type { Vehicle, VehicleSubmission, VehicleSearchResult };
