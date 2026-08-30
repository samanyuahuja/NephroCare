import { createApplication } from "./app.js";
import { log } from "./logger.js";
import { setupVite, serveStatic } from "./vite.js";

const portSetting = process.env.PORT?.trim() || "5000";
const port = /^\d+$/.test(portSetting) ? Number(portSetting) : Number.NaN;
if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

(async () => {
  const { app, server } = await createApplication();

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
