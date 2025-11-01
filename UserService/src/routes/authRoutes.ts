import { Router } from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/authController';

const router : Router = Router();

// Register User
// /api/auth/register
router.post('/register', registerUser);

// Login User
// /api/auth/register
router.post('/login', loginUser);

// Logout user
// /api/auth/register
router.get('/logout', logoutUser)

export default router;