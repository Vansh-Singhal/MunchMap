import mongoose from "mongoose";
import { getMongoUri, getMongoDbName } from "../utils/config";

const connectDB = async () => {
  // Reject startup on failure; the entry point awaits this before listening.
  await mongoose.connect(getMongoUri(), { dbName: getMongoDbName() });
  console.log("MongoDB connected successfully");
};

export default connectDB;
