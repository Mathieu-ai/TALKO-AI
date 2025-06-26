import express from 'express';
import nlpController from '../controllers/nlpController';
import { allowAnonymous } from '../middlewares/authMiddleware';
import { checkFeatureAccess } from '../middlewares/featureAccessMiddleware';
import { FeatureType } from '../types/featureTypes';

const router = express.Router();

// NLP routes, allowed for both anonymous and authenticated users with limits
router.post('/sentiment', allowAnonymous, checkFeatureAccess(FeatureType.NLP), nlpController.analyzeSentiment);
router.post('/entities', allowAnonymous, checkFeatureAccess(FeatureType.NLP), nlpController.extractEntities);
router.post('/keywords', allowAnonymous, checkFeatureAccess(FeatureType.NLP), nlpController.extractKeywords);
router.post('/summarize', allowAnonymous, checkFeatureAccess(FeatureType.NLP), nlpController.summarizeText);

export default router;
