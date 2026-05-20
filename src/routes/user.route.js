import express from 'express';
import { usersRoute } from '../controller/user.controller.js';
import protectRoute from '../../middleware/protectRoute.js';

const router = express.Router();

router.get('/search', protectRoute, usersRoute);

export default router;