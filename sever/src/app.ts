import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routers/auth.router.js";
import adminRouter from "./routers/admin/user-management.router.js";
import profileRouter from "./routers/site/profile.router.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { AppError } from "./utils/AppError.js";
import prisma from "./config/db.js";
import { runSeeds } from "./seeds/index.js";

const app = express();

// ── Core Middleware ───────────────────────────────────────────────────────────
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: [clientUrl, "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Static Files (uploaded avatars) ──────────────────────────────────────────
app.use("/uploads", express.static("uploads"));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/profile", profileRouter);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorMiddleware);

/**
 * Initializes connections and starts the Express HTTP server listener.
 */
export async function startServer(): Promise<void> {
  const PORT = process.env.PORT || 5000;
  try {
    // Verify database connection connectivity on startup
    await prisma.$connect();
    console.log("DB connection established successfully! 🔌");

    // Run seed files
    await runSeeds();

    const server = app.listen(PORT, () => {
      console.log(`Server running → http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode 🚀`);
    });

    // Handle unhandled promise rejections globally
    process.on("unhandledRejection", (err: any) => {
      console.error("UNHANDLED REJECTION! 💥 Shutting down gracefully...");
      console.error(err.name, err.message, err.stack);
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown on SIGTERM / SIGINT signals
    const handleShutdown = (signal: string) => {
      console.log(`${signal} received. Closing HTTP server gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log("DB connections disconnected. Process terminated.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
    process.on("SIGINT", () => handleShutdown("SIGINT"));

  } catch (error) {
    console.error("Failed to initialize server connection:", error);
    process.exit(1);
  }
}

export { app };
export default app;
