interface VehiclePhoto {
	id: string;
	photo: string;
	isPrimary?: boolean;
	vehicleId: string;
}

interface Logo {
	id: string;
	name: string;
	url: string;
	uploadSizeKb?: number | null;
	updatedAt?: Date;
}

export type { VehiclePhoto, Logo };
