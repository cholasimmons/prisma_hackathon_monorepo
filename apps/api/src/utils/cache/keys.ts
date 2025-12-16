export const CacheKeys = {
  user: {
    byId: (id: string | number) => `user:${id}`,
    permissions: (id: string | number) => `user:${id}:permissions`,
    profile: (id: string | number) => `user:${id}:profile`,
  },

  session: {
    byToken: (token: string) => `session:${token}`,
    active: "session:active",
  },

  vehicles: {
    all: "vehicles:all",
    allQueried: (query: string) => `vehicles:all:query:${query}`,
    byId: (id: string | number) => `vehicle:${id}`,
    byPlate: (plate: string) => `vehicle:plate:${plate}`,
    byMake: (make: string) => `vehicles:make:${make}`,
    submissionById: (id: string) => `vehicleSubmission:${id}`,
    submissionByPlate: (plate: string) => `vehicleSubmission:plate:${plate}`,
  },

  logos: {
    all: "logos:all",
    everything: "logos:*",
    byName: (name: string) => `logos:${name}`,
  },

  auth: {
    emailOtp: (email: string) => `auth:otp:${email}`,
    rateLimit: (ip: string) => `auth:rl:${ip}`,
  },

  misc: {
    health: "misc:health",
    version: "misc:version",
  },
} as const;
