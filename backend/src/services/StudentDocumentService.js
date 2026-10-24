import { randomUUID } from 'crypto';
import { extname } from 'path';
import { supabase } from '../database/supabaseClient.js';
import { config } from '../config/index.js';
import { StudentDocumentRepository } from '../repositories/StudentDocumentRepository.js';
import { MediaRepository } from '../repositories/MediaRepository.js';
import { MediaStorageService } from './MediaStorageService.js';
import { roleRepository } from '../repositories/UserRoleRepository.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve whether the current user is an admin/super admin.
 * Robustly checks both role_id (e.g. EDUGATE_SUPER_ADMIN, SUPER_ADMIN, EDUGATE_ADMIN, ADMIN)
 * and role_name if available.
 */
async function isAdmin(currentUser) {
    if (!currentUser) return false;

    const roleId = String(currentUser.role_id || '').toUpperCase();
    if (
        roleId === 'SUPER_ADMIN' ||
        roleId === 'ADMIN' ||
        roleId.endsWith('ADMIN') ||
        roleId.includes('ADMIN') ||
        roleId.includes('SUPER') ||
        roleId === 'MANAGER'
    ) {
        return true;
    }

    let roleName = currentUser.role_name;
    if (!roleName && currentUser.role_id) {
        try {
            const role = await roleRepository.findById(currentUser.role_id);
            roleName = role?.role_name;
        } catch (_) {}
    }

    const normalized = String(roleName || '').toLowerCase();
    return (
        normalized === 'admin' ||
        normalized === 'super admin' ||
        normalized.endsWith('admin') ||
        normalized.includes('admin') ||
        normalized.includes('super')
    );
}

/**
 * Verify that the current user is authorized to access documents for a given client.
 * - Admins: always authorized.
 * - Staff: authorized if the client is assigned to them via
 *   opportunities.assigned_staff_id, conversations.assigned_staff_id, or created_by.
 *
 * Throws 403 if not authorized.
 */
async function assertStudentAccess(currentUser, clientId) {
    const adminUser = await isAdmin(currentUser);
    if (adminUser) return; // Admin sees everything

    // Confirm the client is assigned to this staff member via opportunities
    const { data: opps } = await supabase
        .from('opportunities')
        .select('client_id')
        .eq('client_id', clientId)
        .eq('assigned_staff_id', currentUser.user_id)
        .limit(1);

    if (opps && opps.length > 0) return; // Authorized via opportunity

    // Confirm the client is assigned to this staff member via conversations
    const { data: convs } = await supabase
        .from('conversations')
        .select('client_id')
        .eq('client_id', clientId)
        .eq('assigned_staff_id', currentUser.user_id)
        .limit(1);

    if (convs && convs.length > 0) return; // Authorized via conversation

    // Confirm if client was created by this staff member
    try {
        const { data: client } = await supabase
            .from('clients')
            .select('client_id, created_by')
            .eq('client_id', clientId)
            .limit(1)
            .maybeSingle();

        if (client && Number(client.created_by) === Number(currentUser.user_id)) {
            return; // Authorized as creator
        }
    } catch (_) {}

    const err = new Error('You are not authorized to access documents for this student.');
    err.statusCode = 403;
    throw err;
}

/**
 * Build a safe, unique storage path for a student document.
 * Uses the same pattern as MediaService.buildStoragePath — fully server-generated.
 * No student name, ID, or document name is included in the path.
 */
function buildStoragePath(mimeType, originalName) {
    const category = (() => {
        if (mimeType.startsWith('image/'))       return 'image';
        if (mimeType.startsWith('video/'))       return 'video';
        if (mimeType.startsWith('audio/'))       return 'audio';
        if (mimeType === 'application/pdf')      return 'document';
        if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) return 'document';
        return 'other';
    })();
    const now   = new Date();
    const year  = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const id    = randomUUID();
    const ext   = extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '') || '';
    return `${category}/${year}/${month}/${id}${ext}`;
}

/**
 * Validate a document name: not empty, trimmed length >= 1, max 200 chars,
 * no control characters.
 * @param {string} name
 * @returns {string} Trimmed, validated name
 * @throws Error with statusCode 400 on invalid input
 */
function validateDocumentName(name) {
    if (typeof name !== 'string') {
        const err = new Error('Document name must be a string.');
        err.statusCode = 400;
        throw err;
    }
    const trimmed = name.trim();
    if (trimmed.length === 0) {
        const err = new Error('Document name is required and cannot be empty.');
        err.statusCode = 400;
        throw err;
    }
    if (trimmed.length > 200) {
        const err = new Error('Document name cannot exceed 200 characters.');
        err.statusCode = 400;
        throw err;
    }
    // Reject control characters (except tab, which may appear in pasted text)
    // eslint-disable-next-line no-control-regex
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(trimmed)) {
        const err = new Error('Document name contains invalid characters.');
        err.statusCode = 400;
        throw err;
    }
    return trimmed;
}

// ─── StudentDocumentService ───────────────────────────────────────────────────

export const StudentDocumentService = {

    /**
     * Search for accessible students by client_id (exact match) or name (ILIKE).
     * Returns only students the current user is authorized to access.
     *
     * For staff: returns only clients assigned to them.
     * For admins: returns matching clients from all clients.
     *
     * @param {Object} currentUser
     * @param {Object} params - { clientId, name, page, limit }
     * @returns {{ data: Object[], total: number, page: number, limit: number }}
     */
    async searchStudents(currentUser, { clientId, name, page = 1, limit = 20 } = {}) {
        const adminUser = await isAdmin(currentUser);

        const safePage  = Math.max(1, parseInt(page)  || 1);
        const safeLimit = Math.min(50, Math.max(1, parseInt(limit) || 20));
        const from      = (safePage - 1) * safeLimit;
        const to        = from + safeLimit - 1;

        let query = supabase
            .from('clients')
            .select('client_id, name, email', { count: 'exact' })
            .order('client_id', { ascending: false })
            .range(from, to);

        // Apply search filters
        let parsedId = null;
        if (clientId !== undefined && clientId !== null && clientId !== '') {
            const digits = String(clientId).replace(/^(std|student|client|cl)?[\s-#_]*/i, '').trim();
            if (/^\d+$/.test(digits)) {
                parsedId = parseInt(digits, 10);
            }
        }

        if (parsedId !== null) {
            query = query.eq('client_id', parsedId);
        } else if (name) {
            const trimmedName = String(name).trim();
            const digits = trimmedName.replace(/^(std|student|client|cl)?[\s-#_]*/i, '').trim();
            if (/^\d+$/.test(digits)) {
                const numId = parseInt(digits, 10);
                query = query.or(`client_id.eq.${numId},name.ilike.%${trimmedName}%`);
            } else {
                query = query.ilike('name', `%${trimmedName}%`);
            }
        }

        // Non-admins: restrict to assigned clients
        if (!adminUser) {
            const { data: opps } = await supabase
                .from('opportunities')
                .select('client_id')
                .eq('assigned_staff_id', currentUser.user_id);

            const { data: convs } = await supabase
                .from('conversations')
                .select('client_id')
                .eq('assigned_staff_id', currentUser.user_id);

            let createdClientIds = [];
            try {
                const { data: createdClients } = await supabase
                    .from('clients')
                    .select('client_id')
                    .eq('created_by', currentUser.user_id);
                createdClientIds = (createdClients || []).map(c => c.client_id);
            } catch (_) {}

            const assignedClientIds = Array.from(new Set([
                ...(opps  || []).map(o => o.client_id),
                ...(convs || []).map(c => c.client_id),
                ...createdClientIds,
            ])).filter(Boolean);

            if (assignedClientIds.length === 0) {
                return { data: [], total: 0, page: safePage, limit: safeLimit };
            }
            query = query.in('client_id', assignedClientIds);
        }

        const { data: clients, error, count } = await query;
        if (error) throw error;

        // Attach document counts safely
        const clientIds = (clients || []).map(c => c.client_id);
        let docCounts = [];
        try {
            docCounts = await StudentDocumentRepository.countByClientIds(clientIds);
        } catch (err) {
            console.warn('[StudentDocumentService] countByClientIds warning:', err.message);
        }
        const countMap  = Object.fromEntries(docCounts.map(r => [r.client_id, r.count]));

        const enriched = (clients || []).map(c => ({
            ...c,
            document_count: countMap[c.client_id] || 0,
        }));

        return {
            data:  enriched,
            total: count ?? 0,
            page:  safePage,
            limit: safeLimit,
        };
    },

    /**
     * Upload a document for a student.
     * 1. Verifies authorization for this student.
     * 2. Uploads binary to the existing crm-media bucket.
     * 3. Inserts a media record.
     * 4. Inserts a student_document association record.
     * If step 3 or 4 fails, the storage object is cleaned up before re-throwing.
     *
     * @param {Object} currentUser
     * @param {number} clientId
     * @param {Object} file - Multer file object
     * @param {string} documentName - Staff-provided display name (required)
     * @param {string} [description] - Optional description
     * @returns {Object} student_document record with embedded media and uploader
     */
    async uploadDocument(currentUser, clientId, file, documentName, description) {
        // 1. Authorization
        await assertStudentAccess(currentUser, clientId);

        // 2. Validate document name (user-supplied, not used in file path)
        const cleanName = validateDocumentName(documentName);

        // 3. Build a safe, server-generated storage path
        const storagePath = buildStoragePath(file.mimetype, file.originalname);

        // 4. Upload binary to Supabase Storage
        await MediaStorageService.uploadToSupabase(file.buffer, storagePath, file.mimetype);

        // 5. Persist media metadata — clean up storage if this fails
        let mediaRecord;
        try {
            mediaRecord = await MediaRepository.create({
                original_name:    file.originalname,
                storage_path:     storagePath,
                mime_type:        file.mimetype,
                file_size:        file.size,
                provider:         'supabase',
                provider_file_id: null,
                uploaded_by:      currentUser.user_id,
            });
        } catch (dbError) {
            try {
                await MediaStorageService.deleteFromSupabase(storagePath);
            } catch (cleanupErr) {
                console.error('[StudentDocumentService] Storage cleanup failed after media DB error:', cleanupErr.message);
            }
            throw dbError;
        }

        // 6. Persist student_document association — clean up media+storage if this fails
        let studentDoc;
        try {
            studentDoc = await StudentDocumentRepository.create({
                client_id:     clientId,
                media_id:      mediaRecord.media_id,
                document_name: cleanName,
                description:   description ? description.trim().substring(0, 500) : null,
                uploaded_by:   currentUser.user_id,
            });
        } catch (assocError) {
            // Compensating: remove media record and storage object
            try {
                await MediaRepository.deleteById(mediaRecord.media_id);
            } catch (_) {}
            try {
                await MediaStorageService.deleteFromSupabase(storagePath);
            } catch (_) {}
            throw assocError;
        }

        return studentDoc;
    },

    /**
     * List documents for a specific student.
     * Enforces authorization before returning any data.
     *
     * @param {Object} currentUser
     * @param {number} clientId
     * @param {Object} params - { page, limit, search }
     * @returns {{ data, total, page, limit }}
     */
    async listDocuments(currentUser, clientId, { page = 1, limit = 20, search } = {}) {
        await assertStudentAccess(currentUser, clientId);

        const { data, total } = await StudentDocumentRepository.findByClientId({
            clientId, page, limit, search,
        });

        return {
            data,
            total,
            page:  parseInt(page)  || 1,
            limit: parseInt(limit) || 20,
        };
    },

    /**
     * Generate a signed URL for a student document.
     * Verifies authorization against the document's client.
     *
     * @param {Object} currentUser
     * @param {number} docId - student_documents.id
     * @returns {{ url: string, expires_in: number }}
     */
    async getSignedUrl(currentUser, docId) {
        const doc = await StudentDocumentRepository.findById(docId);
        if (!doc) {
            const err = new Error('Document not found.');
            err.statusCode = 404;
            throw err;
        }

        await assertStudentAccess(currentUser, doc.client_id);

        const expiresIn = config.media.signedUrlExpirySeconds;
        const url       = await MediaStorageService.getSupabaseSignedUrl(doc.media.storage_path, expiresIn);

        return { url, expires_in: expiresIn };
    },

    /**
     * Rename a document (updates document_name and/or description only).
     * The underlying media binary is NOT changed.
     *
     * @param {Object} currentUser
     * @param {number} docId
     * @param {string} newName
     * @param {string} [newDescription]
     * @returns {Object} Updated student_document record
     */
    async renameDocument(currentUser, docId, newName, newDescription) {
        const doc = await StudentDocumentRepository.findById(docId);
        if (!doc) {
            const err = new Error('Document not found.');
            err.statusCode = 404;
            throw err;
        }

        await assertStudentAccess(currentUser, doc.client_id);

        const cleanName = validateDocumentName(newName);

        const updates = { document_name: cleanName };
        if (newDescription !== undefined) {
            updates.description = newDescription ? newDescription.trim().substring(0, 500) : null;
        }

        return StudentDocumentRepository.updateById(docId, updates);
    },

    /**
     * Delete a student document association AND the underlying media/storage object.
     * Authorization: only the uploader or an admin may delete.
     *
     * Failure handling:
     * - Association record is deleted first.
     * - Media record is deleted second.
     * - Storage object deletion is best-effort.
     *
     * @param {Object} currentUser
     * @param {number} docId
     * @returns {Object} Deleted student_document record
     */
    async deleteDocument(currentUser, docId) {
        const doc = await StudentDocumentRepository.findById(docId);
        if (!doc) {
            const err = new Error('Document not found.');
            err.statusCode = 404;
            throw err;
        }

        // Authorization: must have access to this student
        await assertStudentAccess(currentUser, doc.client_id);

        // Further restriction: only the uploader or admin can delete
        const adminUser = await isAdmin(currentUser);
        if (!adminUser && doc.uploaded_by !== currentUser.user_id) {
            const err = new Error('You do not have permission to delete this document.');
            err.statusCode = 403;
            throw err;
        }

        const mediaId       = doc.media_id;
        const storagePath   = doc.media?.storage_path;

        // 1. Delete association (source of truth for the student link)
        const deleted = await StudentDocumentRepository.deleteById(docId);

        // 2. Delete media metadata record
        try {
            await MediaRepository.deleteById(mediaId);
        } catch (mediaDeleteErr) {
            console.error('[StudentDocumentService] Failed to delete media record after association deletion:', mediaDeleteErr.message);
        }

        // 3. Delete storage object (best-effort)
        if (storagePath) {
            try {
                await MediaStorageService.deleteFromSupabase(storagePath);
            } catch (storageErr) {
                console.error('[StudentDocumentService] Storage deletion failed (manual cleanup may be required):', storageErr.message);
            }
        }

        return deleted;
    },
};
