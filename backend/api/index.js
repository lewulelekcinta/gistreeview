import 'dotenv/config';
import express from "express";
import prisma from "../src/prismaClient.js";
// Global process-level handlers to capture and log crashes early in startup.
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason && reason.stack ? reason.stack : reason);
});
// Route modules will be imported dynamically to avoid module-load crashes
// bringing down the whole serverless function.
import cors from "cors";
import path from "path";
import serverless from "serverless-http";

const app = express();
// Use shared prisma client from src/prismaClient.js

// Configure CORS origins via env var for easier deployment configuration on Vercel.
// Set ALLOWED_ORIGINS as a comma-separated list (e.g. "https://my-frontend.vercel.app,https://other.com").
const defaultOrigins = [
  "http://localhost:4000",
  "http://localhost:5173",
  "https://gistreeview.vercel.app"
];

let allowedOrigins = defaultOrigins;
if (process.env.ALLOWED_ORIGINS) {
  // Split on comma, trim whitespace, and filter empties
  allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map(s => s.trim()).filter(Boolean);
}

// Normalize to lowercase for case-insensitive comparison
allowedOrigins = allowedOrigins.map(o => o.toLowerCase());

// Use a function for CORS origin so we can:
// - allow requests without an Origin header (e.g., curl, Postman)
// - do case-insensitive matching
// - return a clear error for disallowed origins
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const incoming = origin.toLowerCase();
    if (allowedOrigins.includes(incoming)) {
      return callback(null, true);
    }

    // Not allowed
    return callback(new Error(`CORS policy: origin '${origin}' not allowed`), false);
  }
};

// If operator wants to temporarily allow any origin (for debugging or staging),
// set ALLOW_ALL_ORIGINS=1 in Vercel Environment Variables. This will enable
// permissive CORS for testing. Otherwise use the stricter corsOptions above.
if (process.env.ALLOW_ALL_ORIGINS === '1') {
  console.info('ALLOW_ALL_ORIGINS=1 set — enabling permissive CORS for all origins (temporary debug mode)');
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.info('Incoming request origin:', origin);
    next();
  });
  app.use(cors({ origin: true }));
} else {
  app.use(cors(corsOptions));
}
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public", "uploads"))
);

app.get("/", (req, res) => {
  res.json({ message: "Backend API is running" });
});

// Diagnostic endpoint to help debug DB connectivity / DNS issues when deployed.
// - Performs DNS lookup for the DB hostname
// - Attempts a TCP connection to the resolved IP on the DB port
// - Attempts a short Prisma connect to validate credentials/network
// (db-check diagnostic removed - restored to original state)

app.get("/trees", async (req, res) => {
  const trees = await prisma.tree.findMany();
  res.json(trees);
});

// Diagnostic endpoint: quick DB connectivity check using Prisma.
app.get('/dbcheck', async (req, res) => {
  try {
    // a harmless quick query
    const now = await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true, now });
  } catch (err) {
    console.error('DB check failed', err && err.message ? err.message : err);
    res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
  }
});

// Dynamically register routes; if a module fails to load, mount a fallback
// handler that returns 500 JSON instead of crashing the function.
;(async () => {
  const routes = [
    ["/api/trees", "../src/routes/trees.js"],
    ["/api/treepictures", "../src/routes/treepictures.js"],
    ["/api/roads", "../src/routes/roads.js"],
    ["/api/roadpictures", "../src/routes/roadpictures.js"],
    ["/api/register", "../src/routes/register.js"],
    ["/api/login", "../src/routes/login.js"],
    ["/api/reports", "../src/routes/reports.js"],
    ["/api/reportpictures", "../src/routes/reportpictures.js"],
    ["/api/profile", "../src/routes/profile.js"],
  ];

  for (const [mount, modPath] of routes) {
    try {
      const mod = await import(modPath);
      const router = mod.default || mod;
      if (!router) throw new Error(`Module ${modPath} did not export a router`);
      app.use(mount, router);
      console.info(`Mounted ${modPath} at ${mount}`);
    } catch (err) {
      console.error(`Failed to mount ${modPath} at ${mount}:`, err && err.message ? err.message : err);
      app.use(mount, (req, res) => res.status(500).json({ error: `Service temporarily unavailable (${mount})` }));
    }
  }
})();

export default app;

// Export a serverless handler for platforms like Vercel that expect a function entry.
// This keeps local usage (importing the app) intact while also providing a handler
// that wraps the Express app for per-invocation execution.
export const handler = serverless(app);
