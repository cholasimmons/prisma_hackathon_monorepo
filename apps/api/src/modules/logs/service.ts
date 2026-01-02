import { AuditEvent, EventType, Prisma } from "@generated/prisma/client";
import { cache } from "~utils/cache";
import db from "~utils/database/client";
import { CacheKeys } from "~utils/cache/keys";
import { Log } from "./model";

abstract class AuditService {
  static async logEvent(body: Log): Promise<AuditEvent | null> {
    const {
      type,
      actorId,
      entity,
      entityId,
      ipAddress,
      userAgent,
      route,
      method,
      metadata,
    } = body;

    return db.auditEvent.create({
      data: {
        type,
        actorId,
        entity,
        entityId,
        ipAddress,
        userAgent,
        route,
        method,
        metadata,
      },
    });
  }

  static async fetchLogs(
    isAdmin: boolean = false,
  ): Promise<AuditEvent[] | null> {
    const where: Prisma.AuditEventWhereInput = {};

    // where.isActive = isAdmin ? undefined : true;

    const logs: AuditEvent[] | null = await db.auditEvent.findMany();

    if (!logs) {
      return null;
    }

    await cache.del(CacheKeys.logs.all);

    await cache.set<AuditEvent[]>(CacheKeys.logs.all, logs, 6000);

    return logs;
  }
}

export default AuditService;
