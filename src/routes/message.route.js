import express from 'express';
import { getMessage, sendMessage, updateMessage, deleteMessage } from '../controller/message.controller.js';
import protectRoute from '../../middleware/protectRoute.js';

const router = express.Router();
router.get('/:id', protectRoute, getMessage)
router.post('/send/:id', protectRoute, sendMessage)
router.put('/:id', protectRoute, updateMessage)
router.delete('/:id', protectRoute, deleteMessage)

export default router;