import "dotenv/config";

import { startServer } from "./app.js";

// Handle uncaught exceptions globally
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Launch server connection lifecycle
startServer();
