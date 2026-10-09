import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadMiddleware, validateFile } from '../validators/MediaValidator.js';
import { MediaController } from '../controllers/MediaController.js';

const router = Router();

// Google Drive OAuth (order matters: must be before /:id routes)

// GET /api/media/google/auth — requires JWT (user must be logged in to connect Drive)
router.get('/google/auth', authenticateToken, MediaController.googleAuthUrl);

// GET /api/media/google/callback — public (no JWT; Google redirects here)
router.get('/google/callback', MediaController.googleCallback);

// Core media endpoints (all require JWT)

router.use(authenticateToken);

// POST /api/media — upload a file (multipart/form-data, field name: "file")
router.post('/', uploadMiddleware, validateFile, MediaController.upload);

// GET /api/media — list with pagination + filters
// ?page=1&limit=20&search=...&mime_type=...&provider=...&uploaded_by=...&date_from=...&date_to=...
router.get('/', MediaController.list);

// GET /api/media/:id — get metadata for a single media record
router.get('/:id', MediaController.getById);

// GET /api/media/:id/url — generate a temporary signed URL for file access
router.get('/:id/url', MediaController.getSignedUrl);

// DELETE /api/media/:id — delete media (uploader or admin only)
router.delete('/:id', MediaController.remove);

export default router;
