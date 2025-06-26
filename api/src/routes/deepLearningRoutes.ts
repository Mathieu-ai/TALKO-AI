import express from 'express';
import deepLearningController from '../controllers/deepLearningController';
import { requireAuth } from '../middlewares/authMiddleware';
import { checkFeatureAccess } from '../middlewares/featureAccessMiddleware';
import { FeatureType } from '../types/featureTypes';

const router = express.Router();

// All deep learning routes require authentication
router.use(requireAuth);

// Analyze user behavior patterns
router.get('/analyze', checkFeatureAccess(FeatureType.DEEP_LEARNING), deepLearningController.analyzeUserBehavior);

// Get personalized learning recommendations
router.get('/recommendations', checkFeatureAccess(FeatureType.DEEP_LEARNING), deepLearningController.getRecommendations);

export default router;
