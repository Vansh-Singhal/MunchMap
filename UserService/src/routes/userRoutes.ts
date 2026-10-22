import { Router } from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  updatePassword,
  deleteAccount,
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { updateUserSchema, updatePasswordSchema } from '../types/userBody';

const router: Router = Router();

// Must be logged in
router.use(protect);

// Profile routes
router.get('/me', getCurrentUser);
router.put('/me', validateRequest(updateUserSchema), updateCurrentUser);
router.put('/me/password', validateRequest(updatePasswordSchema), updatePassword);
router.delete('/me', deleteAccount);

export default router;
