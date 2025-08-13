import express from 'express';
import { sendChatMessage, getChatHealth } from '../controllers/chatController.js';

const router = express.Router();

// Chat endpoints
router.post('/message', sendChatMessage);
router.get('/health', getChatHealth);

export default router;
