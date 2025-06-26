import express from 'express';
import multer from 'multer';
import audioController from '../controllers/audioController';
import { authenticate } from '../middlewares/authMiddleware';
import { checkFeatureAccess } from '../middlewares/featureAccessMiddleware';
import { FeatureType } from '../types/featureTypes';

const router = express.Router();

// Set up multer for audio file uploads
const upload = multer({ dest: 'uploads/audio/' });

// Routes that should be accessible without authentication
router.get('/stream/:filename', authenticate, audioController.streamAudio);

// Apply authentication middleware to all other audio routes
// Remove the general router.use(authenticate) as it was applying to all routes
// Instead apply it to each route individually

// Routes that allow anonymous access but with feature limits
router.post('/text-to-speech', authenticate, checkFeatureAccess(FeatureType.TEXT_TO_SPEECH), audioController.textToSpeech);
router.post('/generate-speech', authenticate, checkFeatureAccess(FeatureType.TEXT_TO_SPEECH), audioController.textToSpeech);

// Routes that require authentication
router.post('/download-zip', authenticate, audioController.downloadMultipleAsZip);
router.post('/download-multiple', authenticate, audioController.downloadMultipleAsZip);
router.get('/export/:id', authenticate, audioController.exportTranscription);
router.post('/export-multiple', authenticate, audioController.exportMultipleTranscriptions);
router.get('/history', authenticate, audioController.getAudioHistory);
router.post('/speech-to-text', authenticate, upload.single('audio'), checkFeatureAccess(FeatureType.SPEECH_TO_TEXT), audioController.speechToText);
router.post('/transcribe', authenticate, upload.single('audio'), audioController.transcribeAudio);
router.get('/download/:filename', authenticate, audioController.getAudio);
router.delete('/:id', authenticate, audioController.deleteAudio);

export default router;