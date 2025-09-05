import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
import { PORT } from './utils/config';
import connectDB from './config/dbconfig';
import authRoutes from './routes/authRoutes';


app.use(express.json());


app.use('/api/auth', authRoutes);


connectDB();

app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});