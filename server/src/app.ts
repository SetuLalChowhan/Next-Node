import express from "express";
import cookieParser from "cookie-parser";
import corsMiddleware from "./middlewares/cors.middleware.js";
import apiRouter from "./routers/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { AppError } from "./utils/AppError.js";

const app = express();

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Static Files (uploaded avatars) ──────────────────────────────────────────
app.use("/uploads", express.static("uploads"));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// ── Consolidated API Routes (v1) ──────────────────────────────────────────────
app.use("/api/v1", apiRouter);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorMiddleware);

export { app };
export default app;
