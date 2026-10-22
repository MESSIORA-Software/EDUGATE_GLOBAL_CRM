import { supabase } from '../database/supabaseClient.js';

/**
 * Repository for student_documents association table.
 * All queries operate at the DB level — no JS-side filtering.
 */
export const StudentDocumentRepository = {

    /**
     * Insert a new student_document record.
     * @param {{ client_id, media_id, document_name, description, uploaded_by }} data
     * @returns {Object} Inserted row
     */
    async create({ client_id, media_id, document_name, description, uploaded_by }) {
        const { data, error } = await supabase
            .from('student_documents')
            .insert([{ client_id, media_id, document_name, description: description || null, uploaded_by }])
            .select(`
                *,
                media:media_id (
                    media_id, original_name, storage_path, mime_type,
                    file_size, provider, provider_file_id, created_at
                ),
                uploader:uploaded_by (user_id, name, email)
            `)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Find a single student_document by its ID.
     * @param {number} id
     * @returns {Object|null}
     */
    async findById(id) {
        const { data, error } = await supabase
            .from('student_documents')
            .select(`
                *,
                media:media_id (
                    media_id, original_name, storage_path, mime_type,
                    file_size, provider, provider_file_id, created_at
                ),
                uploader:uploaded_by (user_id, name, email)
            `)
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    /**
     * Paginated list of documents for a given client.
     * @param {object} opts
     * @param {number} opts.clientId
     * @param {number} [opts.page=1]
     * @param {number} [opts.limit=20]
     * @param {string} [opts.search] - ILIKE on document_name
     * @returns {{ data: Object[], total: number }}
     */
    async findByClientId({ clientId, page = 1, limit = 20, search } = {}) {
        const safePage  = Math.max(1, parseInt(page)  || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const from      = (safePage - 1) * safeLimit;
        const to        = from + safeLimit - 1;

        let query = supabase
            .from('student_documents')
            .select(`
                *,
                media:media_id (
                    media_id, original_name, storage_path, mime_type,
                    file_size, provider, provider_file_id, created_at
                ),
                uploader:uploaded_by (user_id, name, email)
            `, { count: 'exact' })
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (search) {
            query = query.ilike('document_name', `%${search}%`);
        }

        const { data, error, count } = await query;
        if (error) throw error;

        return { data, total: count ?? 0 };
    },

    /**
     * Count documents for a list of client IDs (for folder summaries).
     * Returns an array of { client_id, count }.
     * @param {number[]} clientIds
     * @returns {Object[]}
     */
    async countByClientIds(clientIds) {
        if (!clientIds || clientIds.length === 0) return [];
        const { data, error } = await supabase
            .from('student_documents')
            .select('client_id', { count: 'exact', head: false })
            .in('client_id', clientIds);

        if (error) throw error;

        // Aggregate in JS (Supabase JS SDK doesn't expose GROUP BY directly)
        const counts = {};
        for (const row of data || []) {
            counts[row.client_id] = (counts[row.client_id] || 0) + 1;
        }
        return Object.entries(counts).map(([cid, cnt]) => ({
            client_id: parseInt(cid),
            count: cnt,
        }));
    },

    /**
     * Update document_name and/or description for a record.
     * Only updates metadata — the underlying media file is not changed.
     * @param {number} id
     * @param {{ document_name, description }} updates
     * @returns {Object} Updated row
     */
    async updateById(id, { document_name, description }) {
        const updates = {};
        if (document_name !== undefined) updates.document_name = document_name;
        if (description  !== undefined) updates.description    = description;

        const { data, error } = await supabase
            .from('student_documents')
            .update(updates)
            .eq('id', id)
            .select(`
                *,
                media:media_id (
                    media_id, original_name, storage_path, mime_type,
                    file_size, provider, provider_file_id, created_at
                ),
                uploader:uploaded_by (user_id, name, email)
            `)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete a student_document association by ID.
     * Does NOT delete the underlying media record (caller handles that).
     * @param {number} id
     * @returns {Object} Deleted row
     */
    async deleteById(id) {
        const { data, error } = await supabase
            .from('student_documents')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};
