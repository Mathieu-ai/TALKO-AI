import express from 'express';
import { checkFeatureAccess, requireAuth } from '../middlewares/authMiddleware';
import * as chatController from '../controllers/chatController';

const router = express.Router();

// Public routes with limits
router.post('/send', checkFeatureAccess('conversations'), chatController.sendMessage);

// Protected routes that require authentication
router.get('/history', requireAuth, chatController.getConversationHistory);
router.get('/conversation/:id', requireAuth, chatController.getConversation);
router.delete('/conversation/:id', requireAuth, chatController.deleteConversation);

export default router;