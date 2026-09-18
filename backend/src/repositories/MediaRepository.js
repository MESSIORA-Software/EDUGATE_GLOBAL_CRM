import { supabase } from '../database/supabaseClient.js';

export const MediaRepository = {

    /**
     * Insert a new media record.
     * @param {Object} mediaData
     * @returns {Object} Inserted row
     */
    async create(mediaData) {
        const { data, error } = await supabase
            .from('media')
            .insert([mediaData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Find a single media record by its UUID.
     * @param {string} mediaId
     * @returns {Object|null}
     */
    async findById(mediaId) {
        const { data, error } = await supabase
            .from('media')
            .select(`
                *,
                uploader:uploaded_by (user_id, name, email)
            `)
            .eq('media_id', mediaId)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    /**
     * Paginated, filtered list of media.
     * All filtering is performed at the DB query level — no JS-side filtering.
     *
     * @param {Object} opts
     * @param {number} opts.page         - 1-based page number (default 1)
     * @param {number} opts.limit        - rows per page (default 20, max 100)
     * @param {string} [opts.search]     - ILIKE search on original_name
     * @param {string} [opts.mimeType]   - exact match on mime_type
     * @param {string} [opts.provider]   - exact match on provider
     * @param {string} [opts.uploadedBy] - exact match on uploaded_by (UUID)
     * @param {string} [opts.dateFrom]   - ISO date string, inclusive lower bound on created_at
     * @param {string} [opts.dateTo]     - ISO date string, inclusive upper bound on created_at
     * @returns {{ data: Object[], total: number }}
     */
    async findAll({ page = 1, limit = 20, search, mimeType, provider, uploadedBy, dateFrom, dateTo } = {}) {
        const safePage  = Math.max(1, parseInt(page)  || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const from      = (safePage - 1) * safeLimit;
        const to        = from + safeLimit - 1;

        let query = supabase
            .from('media')
            .select(`
                *,
                uploader:uploaded_by (user_id, name, email)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (search)     query = query.ilike('original_name', `%${search}%`);
        if (mimeType)   query = query.eq('mime_type', mimeType);
        if (provider)   query = query.eq('provider', provider);
        if (uploadedBy) query = query.eq('uploaded_by', uploadedBy);
        if (dateFrom)   query = query.gte('created_at', dateFrom);
        if (dateTo)     query = query.lte('created_at', dateTo);

        const { data, error, count } = await query;
        if (error) throw error;

        return { data, total: count ?? 0 };
    },

    /**
     * Delete a media record by UUID.
     * @param {string} mediaId
     * @returns {Object} Deleted row
     */
    async deleteById(mediaId) {
        const { data, error } = await supabase
            .from('media')
            .delete()
            .eq('media_id', mediaId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};
