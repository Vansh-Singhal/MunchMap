import { Router } from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  updatePassword,
  deleteAccount,
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router: Router = Router();

// Must be logged in
router.use(protect);

// Profile routes
router.get('/me', getCurrentUser);
router.put('/me', updateCurrentUser);
router.put('/me/password', updatePassword);
router.delete('/me', deleteAccount);

export default router;
