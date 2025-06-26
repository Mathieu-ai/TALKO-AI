import express from 'express';
import documentController from '../controllers/documentController';
import { authenticate, allowAnonymous } from '../middlewares/authMiddleware';
import { checkFeatureAccess } from '../middlewares/featureAccessMiddleware';
import { FeatureType } from '../types/featureTypes';
import { documentUpload, handleDocumentUploadErrors } from '../middlewares/documentUploadMiddleware';

const router = express.Router();

// Routes
router.post('/process', authenticate, documentUpload, handleDocumentUploadErrors, documentController.processDocument);
router.post('/extract-text', allowAnonymous, documentUpload, handleDocumentUploadErrors, checkFeatureAccess(FeatureType.DOCUMENT_PROCESSING), documentController.extractText);
router.post('/analyze-excel', authenticate, documentUpload, handleDocumentUploadErrors, documentController.analyzeExcel);

// Make sure document uploads happen before checking feature access
router.post('/summarize', allowAnonymous, documentUpload, handleDocumentUploadErrors, checkFeatureAccess(FeatureType.DOCUMENT_PROCESSING), documentController.summarizeDocument);
router.post('/analyze', allowAnonymous, documentUpload, handleDocumentUploadErrors, checkFeatureAccess(FeatureType.DOCUMENT_PROCESSING), documentController.analyzeDocument);

// History and management (logged-in users only)
router.get('/history', authenticate, documentController.getDocumentHistory);
router.get('/:id', authenticate, documentController.getDocument);
router.delete('/:id', authenticate, documentController.deleteDocument);

export default router;