import express, { ErrorRequestHandler, Express } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import { getPort } from "./utils/config";
import connectDB from "./config/dbconfig";
import router from "./routes/vendorRoutes";

export const createApp = (): Express => {
  const app = express();
  app.use(cors({ origin: "*", credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use("/api/vendor", router);

  const handleRequestError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    const status = typeof error === "object" && error !== null && "status" in error
      ? error.status : undefined;
    if (status === 400 || status === 413 || status === 415) {
      res.status(status).json({ success: false, message: "Invalid request body" });
      return;
    }
    console.error("Vendor request failed", error instanceof Error ? error.name : "Unknown error");
    res.status(500).json({ success: false, message: "Internal server error" });
  };
  app.use(handleRequestError);
  return app;
};

const start = async (): Promise<void> => {
  const port = getPort();
  if (!process.env.JWT_KEY) throw new Error("JWT_KEY is required");
  await connectDB();
  createApp().listen(port, () => {
    console.log(`Vendor service is running on port ${port}`);
  });
};

if (require.main === module) {
  start().catch((error: unknown) => {
    // Database errors can contain connection credentials; avoid printing them.
    console.error("Vendor service startup failed", error instanceof Error ? error.name : "Unknown error");
    process.exitCode = 1;
  });
}
