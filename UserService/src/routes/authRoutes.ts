import { Router } from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';
import { registerSchema, loginSchema } from '../types/userBody';

const router : Router = Router();

// Register User
// /api/auth/register
router.post('/register', validateRequest(registerSchema), registerUser);

// Login User
// /api/auth/login
router.post('/login', validateRequest(loginSchema), loginUser);

// Logout user
// /api/auth/logout
router.get('/logout', logoutUser);

export default router;
