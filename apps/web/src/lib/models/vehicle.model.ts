interface Vehicle {
	id: string;
	plate: string;
	make: string;
	model?: string | null;
	photo?: string | null;
	year?: number | null;
	color: string | null;
	forSale: boolean | null;
}

interface VehicleSubmission {
	id: string;
	plate: string;
	make: string | null;
	model?: string | null;
	color: string | null;
	year?: number | null;
	forSale?: boolean | null;
}

// Search response shape (recommended for backend to return this)
interface VehicleSearchResult {
	vehicles: Vehicle[];
	// Later: submissions?: VehicleSubmission[]; // if needed
}

export type { Vehicle, VehicleSubmission, VehicleSearchResult };
