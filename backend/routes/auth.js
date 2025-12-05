// Authentication routes for user registration, login, and session management
// 
// AI-GENERATED (Cursor AI Assistant)
// Prompt: "Set up authentication routes with protected endpoints for user registration,
// login, profile access, and logout functionality."
// 
// Modifications by Abhishek:
// - Exported the router so it could be used by other files

import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);

export default router;
