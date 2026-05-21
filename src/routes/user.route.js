import express from 'express';
import { usersRoute, getUserById, updateProfile } from '../controller/user.controller.js';
import protectRoute from '../../middleware/protectRoute.js';

const router = express.Router();

router.get('/search', protectRoute, usersRoute);
router.put('/profile', protectRoute, updateProfile);
router.get('/:id', protectRoute, getUserById);

export default router;