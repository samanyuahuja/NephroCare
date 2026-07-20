import { createApplication } from "./app.js";
import { log } from "./logger.js";
import { setupVite, serveStatic } from "./vite.js";

(async () => {
  const { app, server } = await createApplication();

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
