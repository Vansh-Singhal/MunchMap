import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
import { PORT } from "./utils/config";
import connectDB from "./config/dbconfig";

import router from "./routes/menuRoutes";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOption = {
  origin: "*",
  credentials: true,
};
app.use(cors(corsOption));

app.use("/api/menu/", router);

connectDB();

app.listen(PORT, () => {
  console.log(`Menu service is running on port ${PORT}`);
});
