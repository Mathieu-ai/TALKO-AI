import express from 'express';
import * as imageController from '../controllers/imageController';
import { authenticate, allowAnonymous } from '../middlewares/authMiddleware';
import { checkFeatureAccess } from '../middlewares/featureAccessMiddleware';
import { FeatureType } from '../types/featureTypes';

const router = express.Router();

// Routes
router.post('/generate', allowAnonymous, checkFeatureAccess(FeatureType.IMAGE_GENERATION), imageController.generateImage);
router.get('/history', authenticate, imageController.getImageHistory);
router.get('/:id', authenticate, imageController.getImage);
router.delete('/:id', authenticate, imageController.deleteImage);

export default router;