import type { VehiclePhoto } from './photo.model';
import type { VehicleSubmission } from './vehicle.model';

interface UserProfile {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	email: string;
	emailVerified: boolean;
	name: string;
	role?: string | null;
	image?: string | null | undefined | undefined;
	vehicleSubmissions?: VehicleSubmission[] | null;
	vehiclePhotosVerified?: VehiclePhoto[] | null;
	banned: Boolean | null;
	banReason: string | null;
	banExpires: Date | null;
	sessions?: UserSession[] | null;
}

interface UserSession {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	ipAddress?: string | null;
	userAgent?: string | null;

	email: string;
	emailVerified: boolean;
	expiresAt?: Date | null;
	token: string;
	impersonatedBy?: string | null;
	userId: string;
	user: UserProfile;
	activeOrganizationId?: string | null;
}

export type { UserProfile, UserSession };
