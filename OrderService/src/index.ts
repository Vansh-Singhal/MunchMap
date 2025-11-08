import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
import { PORT } from "./utils/config";
import connectDB from "./config/dbconfig";

import router from "./routes/orderRouter";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOption = {
  origin: "*",
  credentials: true,
};
app.use(cors(corsOption));

app.use("/api/orders/", router);

connectDB();

app.listen(PORT, () => {
  console.log(`Order service is running on port ${PORT}`);
});
