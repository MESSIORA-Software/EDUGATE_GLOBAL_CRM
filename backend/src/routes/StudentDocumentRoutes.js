import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadMiddleware, validateFile } from '../validators/MediaValidator.js';
import { StudentDocumentController } from '../controllers/StudentDocumentController.js';

const router = Router();

// All student document endpoints require JWT authentication
router.use(authenticateToken);

// GET  /api/student-documents/students — search for accessible students
router.get('/students', StudentDocumentController.searchStudents);

// POST /api/student-documents/:clientId/documents — upload a document for a student
router.post('/:clientId/documents', uploadMiddleware, validateFile, StudentDocumentController.uploadDocument);

// GET  /api/student-documents/:clientId/documents — list documents for a student
router.get('/:clientId/documents', StudentDocumentController.listDocuments);

// GET  /api/student-documents/doc/:docId/url — get signed URL for a document
router.get('/doc/:docId/url', StudentDocumentController.getSignedUrl);

// PATCH /api/student-documents/doc/:docId — rename document metadata
router.patch('/doc/:docId', StudentDocumentController.renameDocument);

// DELETE /api/student-documents/doc/:docId — delete document + media + storage
router.delete('/doc/:docId', StudentDocumentController.deleteDocument);

export default router;
