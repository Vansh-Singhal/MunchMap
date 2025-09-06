import { Router } from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/authController';

const router : Router = Router();

//Signup, Login, Logout for the users
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser)

export default router;