interface AuthUser {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	email: string;
	emailVerified: boolean;
	name: string;
	role?: string | null;
	image?: string | null | undefined | undefined;
}

interface AuthSession {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	expiresAt: Date;
	token: string;
	ipAddress?: string | null | undefined | undefined;
	userAgent?: string | null | undefined | undefined;
}

type SessionPayload = {
	user: {
		id: string;
		createdAt: Date;
		updatedAt: Date;
		email: string;
		emailVerified: boolean;
		name: string;
		role?: string | null;
		image?: string | null | undefined | undefined;
	} | null;
	session: {
		id: string;
		createdAt: Date;
		updatedAt: Date;
		userId: string;
		expiresAt: Date;
		token: string;
		ipAddress?: string | null | undefined | undefined;
		userAgent?: string | null | undefined | undefined;
	} | null;
};

export type { AuthUser, AuthSession, SessionPayload };
