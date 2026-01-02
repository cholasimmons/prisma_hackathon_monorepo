
import type { EventType } from "@generated/prisma/enums";
import db from "~utils/database/client";

class AuditService {
  async log(opts: {
    actorId?: string;
    type: EventType;
    entity?: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    route: string;
    method: string;
    metadata?: any;
  }) {
    return db.auditEvent.create({
      data: {
        actorId: opts.actorId ?? null,
        type: opts.type,
        entity: opts.entity ?? null,
        entityId: opts.entityId ?? null,
        ipAddress: opts.ipAddress ?? null,
        userAgent: opts.userAgent ?? null,
        route: opts.route,
        method: opts.method,
        metadata: opts.metadata ?? {},
      },
    });
  }
}

// const eventType = {
//   CREATE: "CREATE",
//   UPDATE: "UPDATE",
//   DELETE: "DELETE",
// };

export const audit = new AuditService();
