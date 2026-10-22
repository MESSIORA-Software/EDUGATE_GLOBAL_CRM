import { StudentDocumentService } from '../services/StudentDocumentService.js';

export const StudentDocumentController = {

    // GET /api/student-documents/students?clientId=&name=&page=&limit=
    async searchStudents(req, res, next) {
        try {
            const { clientId, name, page, limit } = req.query;
            const result = await StudentDocumentService.searchStudents(req.user, { clientId, name, page, limit });
            return res.status(200).json({
                status: 'success',
                total:  result.total,
                page:   result.page,
                limit:  result.limit,
                count:  result.data.length,
                data:   result.data,
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/student-documents/:clientId/documents
    async uploadDocument(req, res, next) {
        try {
            const clientId    = parseInt(req.params.clientId);
            const documentName = req.body.document_name;
            const description  = req.body.description;

            if (!clientId || isNaN(clientId)) {
                return res.status(400).json({ status: 'error', message: 'Invalid client ID.' });
            }

            const doc = await StudentDocumentService.uploadDocument(
                req.user, clientId, req.file, documentName, description,
            );

            return res.status(201).json({
                status:  'success',
                message: 'Document uploaded successfully.',
                data:    doc,
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/student-documents/:clientId/documents?page=&limit=&search=
    async listDocuments(req, res, next) {
        try {
            const clientId = parseInt(req.params.clientId);
            if (!clientId || isNaN(clientId)) {
                return res.status(400).json({ status: 'error', message: 'Invalid client ID.' });
            }

            const { page, limit, search } = req.query;
            const result = await StudentDocumentService.listDocuments(req.user, clientId, { page, limit, search });

            return res.status(200).json({
                status: 'success',
                total:  result.total,
                page:   result.page,
                limit:  result.limit,
                count:  result.data.length,
                data:   result.data,
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/student-documents/doc/:docId/url
    async getSignedUrl(req, res, next) {
        try {
            const docId = parseInt(req.params.docId);
            if (!docId || isNaN(docId)) {
                return res.status(400).json({ status: 'error', message: 'Invalid document ID.' });
            }

            const result = await StudentDocumentService.getSignedUrl(req.user, docId);

            return res.status(200).json({
                status: 'success',
                data:   result,
            });
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/student-documents/doc/:docId
    async renameDocument(req, res, next) {
        try {
            const docId = parseInt(req.params.docId);
            if (!docId || isNaN(docId)) {
                return res.status(400).json({ status: 'error', message: 'Invalid document ID.' });
            }

            const { document_name, description } = req.body;
            const updated = await StudentDocumentService.renameDocument(
                req.user, docId, document_name, description,
            );

            return res.status(200).json({
                status:  'success',
                message: 'Document renamed successfully.',
                data:    updated,
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/student-documents/doc/:docId
    async deleteDocument(req, res, next) {
        try {
            const docId = parseInt(req.params.docId);
            if (!docId || isNaN(docId)) {
                return res.status(400).json({ status: 'error', message: 'Invalid document ID.' });
            }

            const deleted = await StudentDocumentService.deleteDocument(req.user, docId);

            return res.status(200).json({
                status:  'success',
                message: 'Document deleted successfully.',
                data:    deleted,
            });
        } catch (error) {
            next(error);
        }
    },
};
