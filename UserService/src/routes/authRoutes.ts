import express from 'express';
const router = express.Router();
import { registerUser } from '../controllers/authController';

// const {protect, restrictTo} = require("../middlewares/authMiddleware");

router.post('/register', registerUser);
// router.post('/login', loginUser);

// router.get('/admin-dashboard', protect, restrictTo('admin'), (req, res) => {
//     res.status(200).json( {
//         message: `Welcome Admin ${req.user.firstName}`
//     });
// })

// router.get('/user-dashboard', protect, restrictTo('admin', 'user'), (req, res) => {
//     res.status(200).json( {
//         message: `Welcome User ${req.user.firstName}`
//     });
// })

router.get('/', ( _ , res) => {
  return res.json({ message: 'Hello from /api/user!' });
});

export default router;