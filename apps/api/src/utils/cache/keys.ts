import { EventType } from "@generated/prisma/enums";

const CacheKeys = {
  user: {
    all: "users:all",
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

  logs: {
    all: "logs:all",
    everything: "logs:*",
    byType: (type: EventType) => `logs:${type}`,
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

const RedisEvents = {
  sendEmail: 'email:send',
  processImage: 'image:process',
  processUserImage: 'image:user:process',
  submitVehicle: 'vehicle:submit',
  submitVehiclePhotos: 'vehicle:submit:photos',
} as const;

export { CacheKeys, RedisEvents }