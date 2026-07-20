import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { log } from "./vite";

export async function createApplication() {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));

  app.use("/api/", rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  }));

  const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Chat rate limit reached. Please wait before sending more messages." },
  });
  app.use("/api/chat-direct", chatLimiter);
  app.use("/api/chat-message", chatLimiter);

  app.use("/api/ckd-assessment", rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Assessment rate limit reached. Please wait before submitting again." },
  }));

  app.use("/api/diet-plan", rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Diet plan rate limit reached. Please wait before submitting again." },
  }));

  app.use((req, res, next) => {
    const start = Date.now();
    let capturedJsonResponse: Record<string, unknown> | undefined;
    const originalResJson = res.json;

    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      if (!req.path.startsWith("/api")) return;

      const duration = Date.now() - start;
      let logLine = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine.length > 80 ? `${logLine.slice(0, 79)}...` : logLine);
    });

    next();
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    console.error(`[ERROR] ${status}:`, err.message || err);
    const message = status < 500 ? (err.message || "Bad Request") : "Internal Server Error";
    res.status(status).json({ error: message });
  });

  return { app, server };
}
