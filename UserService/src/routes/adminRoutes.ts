import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from '../controllers/adminController';
import { protect, isAdmin } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { userIdSchema, userListSchema, updateAdminUserSchema } from "../types/userBody";

const router: Router = Router();

// // Admin protection middleware
router.use(protect);
router.use(isAdmin);

// // Admin-only user management
router.get('/users', validateRequest(userListSchema, 'query'), getAllUsers);
router.get('/users/:id', validateRequest(userIdSchema, 'params'), getUserById);
router.put('/users/:id', validateRequest(userIdSchema, 'params'), validateRequest(updateAdminUserSchema), updateUserById);
router.delete('/users/:id', validateRequest(userIdSchema, 'params'), deleteUserById);

export default router;
