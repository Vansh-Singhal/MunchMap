import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from '../controllers/adminController';
import { protect, isAdmin } from "../middleware/authMiddleware";

const router: Router = Router();

// // Admin protection middleware
router.use(protect);
router.use(isAdmin);

// // Admin-only user management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUserById);
router.delete('/users/:id', deleteUserById);

export default router;
