import cors from "cors";

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

export const corsMiddleware = cors({
  origin: [clientUrl, "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

export default corsMiddleware;
