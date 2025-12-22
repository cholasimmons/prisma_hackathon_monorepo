import type { Vehicle } from './vehicle.model';

interface VehiclePhoto {
	id: string;
	url: string;
	isPrimary: boolean;
	uploadSizeKb?: number | null;

	pHash?: string | null;
	width?: number | null;
	height?: number | null;

	vehicleId?: string | null;
	vehicle?: Vehicle | null;

	createdAt: Date;
	updatedAt?: Date | null;
}

interface Logo {
	id: string;
	name: string;
	url: string;
	uploadSizeKb?: number | null;
	updatedAt?: Date;
}

export type { VehiclePhoto, Logo };
