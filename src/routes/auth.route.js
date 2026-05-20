import express from 'express';

import dotenv from 'dotenv';
import { login, logout, signup, getMe } from '../controller/auth.controller.js';
import protectRoute from '../middleware/protectRoute.js';
dotenv.config();

const router = express.Router();

router.post('/signup', signup)

router.post('/login', login)

router.get('/me', protectRoute, getMe);

router.post('/logout', logout)

export default router;