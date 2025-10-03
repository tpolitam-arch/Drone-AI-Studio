// server/api.ts
import serverless from "serverless-http";
import express, { type Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";
import { log } from "./vite";

dotenv.config();

/**
 * Serverless wrapper for Vercel (or other platforms).
 * - Initializes an Express app once and reuses it.
 * - Uses registerRoutes(app) to mount all routes from your existing server code.
 * - Exposes a handler that serverless platforms call for each request.
 */

let handler: ReturnType<typeof serverless> | null = null;
let initPromise: Promise<void> | null = null;

function parseAllowedOrigins(): string[] | undefined {
  // Provide ALLOWED_ORIGINS as a comma-separated list in env, e.g.:
  // ALLOWED_ORIGINS="http://localhost:5173,https://yoursite.netlify.app"
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) return undefined;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

async function initApp(): Promise<void> {
  if (handler) return;

  const app = express();

  // Body parsing
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  // CORS: allow specific origins if ALLOWED_ORIGINS is set, otherwise allow all (dev)
  const allowed = parseAllowedOrigins();
  if (allowed && allowed.length > 0) {
    app.use(
      cors({
        origin: (origin, cb) => {
          // allow non-browser requests (e.g. curl, server-to-server)
          if (!origin) return cb(null, true);
          if (allowed.indexOf(origin) !== -1) return cb(null, true);
          return cb(new Error("CORS not allowed"), false);
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
      })
    );
    log?.(`CORS configured for: ${allowed.join(", ")}`);
  } else {
    // permissive for development / if env var not provided
    app.use(cors());
    log?.("CORS: permissive (no ALLOWED_ORIGINS configured)");
  }

  // Logging middleware (similar behavior as your index.ts)
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    // override res.json to capture body for logging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.json = function (bodyJson: any, ...args: any[]) {
      capturedJsonResponse = bodyJson;
      // eslint-disable-next-line prefer-rest-params
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          try {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          } catch {
            // ignore stringify errors
          }
        }
        if (logLine.length > 120) {
          logLine = logLine.slice(0, 119) + "…";
        }
        if (typeof log === "function") {
          log(logLine);
        } else {
          // fallback to console
          // eslint-disable-next-line no-console
          console.log(logLine);
        }
      }
    });

    next();
  });

  // Register your routes (assumes registerRoutes mounts routes on the app)
  // If registerRoutes returns something or expects other args, ensure compatibility.
  await registerRoutes(app);

  // Global error handler
  // Note: in serverless we should not call process.exit; just respond
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as any)?.status || (err as any)?.statusCode || 500;
    const message = (err as any)?.message || "Internal Server Error";
    try {
      res.status(status).json({ message });
    } catch {
      // ignore failed response send
    }
    // log the error for server-side debugging
    // eslint-disable-next-line no-console
    console.error(err);
  });

  // convert to serverless handler
  handler = serverless(app);
}

function ensureInit(): Promise<void> {
  if (!initPromise) initPromise = initApp();
  return initPromise;
}

// Export the serverless handler. Vercel/other serverless platforms will call this function.
export default async function (req: any, res: any) {
  try {
    await ensureInit();
    if (!handler) {
      // should not happen
      // eslint-disable-next-line no-console
      console.error("Serverless handler not initialized");
      res.statusCode = 500;
      return res.end("Server initialization error");
    }
    return handler(req, res);
  } catch (err) {
    // initialization failed
    // eslint-disable-next-line no-console
    console.error("Initialization error:", err);
    res.statusCode = 500;
    return res.end("Server initialization error");
  }
}
