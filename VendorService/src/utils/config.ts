export const getMongoDbName = (): string => process.env.MONGO_DB_NAME?.trim() || "vendordb";

export const getMongoUri = (): string => {
  if (process.env.MONGO_URI?.trim()) return process.env.MONGO_URI.trim();
  const { MONGO_USERNAME, MONGO_PASSWORD } = process.env;
  if (!MONGO_USERNAME || !MONGO_PASSWORD) {
    throw new Error("Set MONGO_URI or MONGO_USERNAME and MONGO_PASSWORD");
  }
  return `mongodb://${encodeURIComponent(MONGO_USERNAME)}:${encodeURIComponent(MONGO_PASSWORD)}@mongo-db:27017/${encodeURIComponent(getMongoDbName())}?authSource=admin`;
};

export const getPort = (): number => {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return port;
};
