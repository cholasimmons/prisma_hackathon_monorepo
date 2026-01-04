import { Elysia, t } from "elysia";
import { betterAuth } from "~middleware/betterauth";
import AuditService from "./logs.service";

const auditController = new Elysia({
  prefix: "/logs",
})
.state({
  single: 'Log',
  plural: 'Logs'
})

  .use(betterAuth)

  // Get all logos
  .get("/", async ({ status }) => {
    const logs = await AuditService.fetchLogs();

    if (!logs) {
      console.error("❌ Failed to fetch logs");
      return status(404, "Could not fetch logs");
    }

    return status(200, { data: logs, message: `Fetched ${logs.length} logs` });
  })

  .get("/health", ({ status }) => {
    return status(200, { success: true, message: "Audit service is healthy" });
  });

export default auditController;
