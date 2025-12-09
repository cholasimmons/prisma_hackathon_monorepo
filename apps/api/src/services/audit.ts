import db from "~/utils/database/client";

class AuditService {
  async log(opts: {
    actorId?: string;
    eventType: string;
    entity?: string;
    metadata?: any;
  }) {
    return db.auditEvent.create({
      data: {
        actorId: opts.actorId ?? null,
        eventType: opts.eventType,
        entity: opts.entity ?? null,
        metadata: opts.metadata ?? {},
      },
    });
  }
}

const eventType = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
};

export const audit = new AuditService();
