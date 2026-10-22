import mongoose from "mongoose";
import { getMongoUri, getMongoDbName } from "../utils/config";

const connectDB = async () => {
  await mongoose.connect(getMongoUri(), { dbName: getMongoDbName() });
  console.log("MongoDB connected successfully");
};

export default connectDB;
