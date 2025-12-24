// import { Log } from "@/generated/prisma/client";

import { EventType } from "@/generated/prisma/enums";
import { NullableJsonNullValueInput } from "@/generated/prisma/internal/prismaNamespace";
import { InputJsonValue } from "@prisma/client/runtime/client";

// const PublicLogFields = ["id", "actorId", "createdAt"] as const;

// type Log = Pick<AuditLog, (typeof PublicLogFields)[number]>;

// export { PublicLogFields };
// export type { PublicLog };

type Log = {
  type: EventType;
  actorId?: string;
  entity?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  route?: string;
  method?: string;
  metadata?: NullableJsonNullValueInput | InputJsonValue | undefined;
};

export type { Log };
