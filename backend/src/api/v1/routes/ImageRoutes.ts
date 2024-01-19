// Express
import express from 'express';
// Middleware
import { authenticateUser } from '../middleware/authenticate';
// Controllers
import { getImage } from '../controllers/imageController';
// Services
import { checkParams, uploadProgress, uploadImage } from '../services/imageService';

const router = express.Router();

// get profile image or post image
router.get(['/:username', '/post/:id'], getImage);

router.post(['/', '/post/:id'], authenticateUser, checkParams, uploadProgress, uploadImage);

export default router;
