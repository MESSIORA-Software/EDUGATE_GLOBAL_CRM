import { supabase } from '../database/supabaseClient.js';

export const CalendarRepository = {

    /**
     * Insert a new calendar event.
     * @param {Object} eventData
     * @returns {Promise<Object>} Inserted event with joined metadata
     */
    async create(eventData) {
        const { data, error } = await supabase
            .from('calendar_events')
            .insert([eventData])
            .select(`
                *,
                assigned_staff:assigned_staff_id (user_id, name, email),
                client:client_id (client_id, name, email),
                creator:created_by (user_id, name, email)
            `)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Find a single calendar event by event_id.
     * @param {number|string} eventId
     * @returns {Promise<Object|null>}
     */
    async findById(eventId) {
        const { data, error } = await supabase
            .from('calendar_events')
            .select(`
                *,
                assigned_staff:assigned_staff_id (user_id, name, email),
                client:client_id (client_id, name, email),
                creator:created_by (user_id, name, email),
                updater:updated_by (user_id, name, email)
            `)
            .eq('event_id', eventId)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    /**
     * Paginated, database-level filtered list of calendar events.
     *
     * @param {Object} opts
     * @param {number} [opts.page=1]
     * @param {number} [opts.limit=20]
     * @param {string} [opts.date]           - Exact match YYYY-MM-DD
     * @param {string} [opts.dateFrom]       - Inclusive lower bound YYYY-MM-DD
     * @param {string} [opts.dateTo]         - Inclusive upper bound YYYY-MM-DD
     * @param {number|string} [opts.staffId]  - Filter by assigned_staff_id
     * @param {number|string} [opts.clientId] - Filter by client_id
     * @param {string} [opts.search]         - ILIKE match on title or reason
     * @param {number|string} [opts.userScopeId] - For staff RBAC: user must be assigned OR creator
     * @returns {Promise<{ data: Object[], total: number }>}
     */
    async findAll({
        page = 1,
        limit = 20,
        date,
        dateFrom,
        dateTo,
        staffId,
        clientId,
        search,
        userScopeId,
    } = {}) {
        const safePage  = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const from      = (safePage - 1) * safeLimit;
        const to        = from + safeLimit - 1;

        let query = supabase
            .from('calendar_events')
            .select(`
                *,
                assigned_staff:assigned_staff_id (user_id, name, email),
                client:client_id (client_id, name, email),
                creator:created_by (user_id, name, email)
            `, { count: 'exact' })
            .order('event_date', { ascending: true })
            .order('start_time', { ascending: true, nullsFirst: false })
            .range(from, to);

        // Date filters
        if (date) {
            query = query.eq('event_date', date);
        } else {
            if (dateFrom) query = query.gte('event_date', dateFrom);
            if (dateTo)   query = query.lte('event_date', dateTo);
        }

        // Staff & Client explicit filters
        if (staffId)  query = query.eq('assigned_staff_id', staffId);
        if (clientId) query = query.eq('client_id', clientId);

        // ILIKE search filter
        if (search) {
            query = query.or(`title.ilike.%${search}%,reason.ilike.%${search}%`);
        }

        // RBAC scoping for non-admin staff
        if (userScopeId) {
            query = query.or(`assigned_staff_id.eq.${userScopeId},created_by.eq.${userScopeId}`);
        }

        const { data, error, count } = await query;
        if (error) throw error;

        return { data: data || [], total: count ?? 0 };
    },

    /**
     * Update an existing calendar event.
     * @param {number|string} eventId
     * @param {Object} updateData
     * @returns {Promise<Object>} Updated event row
     */
    async update(eventId, updateData) {
        const { data, error } = await supabase
            .from('calendar_events')
            .update(updateData)
            .eq('event_id', eventId)
            .select(`
                *,
                assigned_staff:assigned_staff_id (user_id, name, email),
                client:client_id (client_id, name, email),
                creator:created_by (user_id, name, email),
                updater:updated_by (user_id, name, email)
            `)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete a calendar event by ID.
     * @param {number|string} eventId
     * @returns {Promise<Object>} Deleted event row
     */
    async deleteById(eventId) {
        const { data, error } = await supabase
            .from('calendar_events')
            .delete()
            .eq('event_id', eventId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
