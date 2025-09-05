export const MONGO_USERNAME = process.env.MONGO_USERNAME || 'admin';
export const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'admin';
export const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'userdb';
export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
export const JWT_SECRET = process.env.JWT_SECRET || '';
