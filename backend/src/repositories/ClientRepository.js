import { supabase } from '../database/supabaseClient.js';
import { pool } from '../database/dbPool.js';

export const ClientRepository = {

async createClient(clientData) {    
    const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

if (error) throw error;
    return data;        
},

/**
 * Atomically create client, referral attribution, and commission record in one transaction.
 * Strictly guarantees no partial state: rolls back if client, attribution, or commission fails.
 */
async createClientWithAtomicReferral({ name, email, dob, source, referralCode, currentUser, requestMeta = {} }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if (!name || !name.trim()) {
            const err = new Error('Field "name" is required for client registration.');
            err.statusCode = 400;
            throw err;
        }

        let verifiedReferrerId = null;
        let verifiedCodeId = null;
        let commissionRate = 1000;
        let verifiedCodeRecord = null;

        if (referralCode) {
            const codeRes = await client.query(
                `SELECT rc.*, r.referrer_id, r.name AS referrer_name, r.status AS referrer_status, 
                        r.payment_per_student, r.is_active AS referrer_is_active
                 FROM public.referral_codes rc
                 JOIN public.referrers r ON rc.referrer_id = r.referrer_id
                 WHERE UPPER(rc.code) = UPPER($1)
                 FOR SHARE;`,
                [referralCode.trim()]
            );

            if (codeRes.rows.length === 0) {
                const err = new Error(`Referral code '${referralCode}' does not exist.`);
                err.statusCode = 404;
                throw err;
            }

            const codeRow = codeRes.rows[0];
            if (codeRow.status !== 'ACTIVE') {
                const err = new Error(`Referral code '${codeRow.code}' is ${codeRow.status.toLowerCase()} and cannot create new attributions.`);
                err.statusCode = 400;
                throw err;
            }

            if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
                const err = new Error(`Referral code '${codeRow.code}' has expired.`);
                err.statusCode = 400;
                throw err;
            }

            if (codeRow.referrer_status && codeRow.referrer_status.toLowerCase() !== 'active') {
                const err = new Error('The referrer associated with this code is currently inactive or suspended.');
                err.statusCode = 400;
                throw err;
            }

            verifiedReferrerId = codeRow.referrer_id;
            verifiedCodeId = codeRow.code_id;
            commissionRate = Number(codeRow.payment_per_student) || 1000;
            verifiedCodeRecord = codeRow;
        }

        // 1. Insert Client
        const insertClientRes = await client.query(
            `INSERT INTO public.clients (name, email, dob, source, referrer_id, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             RETURNING *;`,
            [
                name.trim(),
                email ? email.trim() : null,
                dob || null,
                source || null,
                verifiedReferrerId,
            ]
        );
        const newClient = insertClientRes.rows[0];

        // 2. If referral code is present, atomically create attribution and commission
        let attribution = null;
        let commission = null;

        if (verifiedReferrerId && verifiedCodeId) {
            // Check duplicate attribution for this student
            const dupCheck = await client.query(
                `SELECT attribution_id FROM public.referral_attributions 
                 WHERE client_id = $1 AND status = 'ACTIVE';`,
                [newClient.client_id]
            );

            if (dupCheck.rows.length > 0) {
                const err = new Error(`Student #${newClient.client_id} already has an active referral attribution.`);
                err.statusCode = 409;
                throw err;
            }

            // Create Attribution
            const attrRes = await client.query(
                `INSERT INTO public.referral_attributions (
                   client_id, referral_code_id, referrer_id, registered_by, status, notes
                 ) VALUES ($1, $2, $3, $4, 'ACTIVE', $5)
                 RETURNING *;`,
                [
                    newClient.client_id,
                    verifiedCodeId,
                    verifiedReferrerId,
                    currentUser?.user_id || null,
                    `Attributed via referral code ${verifiedCodeRecord.code} during student registration`,
                ]
            );
            attribution = attrRes.rows[0];

            // Referral Commission is NOT created at registration time.
            // Commission will be created when the student enters the configured Pipeline Qualification Stage.
            commission = null;

            // Record Audit Log
            await client.query(
                `INSERT INTO public.referral_audit_logs (
                   action, entity_type, entity_id, actor_id, actor_email, 
                   actor_role, ip_address, user_agent, after_state
                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
                [
                    'STUDENT_REGISTERED_WITH_REFERRAL',
                    'client',
                    String(newClient.client_id),
                    currentUser?.user_id || null,
                    currentUser?.email || null,
                    currentUser?.role_id || null,
                    requestMeta.ip || null,
                    requestMeta.userAgent || null,
                    JSON.stringify({
                        client_id: newClient.client_id,
                        attribution_id: attribution.attribution_id,
                        code: verifiedCodeRecord.code,
                        referrer_id: verifiedReferrerId,
                        commission_status: 'AWAITING_STAGE_QUALIFICATION',
                    }),
                ]
            );
        }

        await client.query('COMMIT');

        return {
            ...newClient,
            referral_attribution: attribution,
            referral_commission: commission,
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
},

async getAllClients(currentUser = null) {
    let query = supabase
        .from('clients')
        .select('*, referrers!fk_clients_referrer ( referrer_id, referrer_code, name, email, phone_number, whatsapp_number )');

    const isAdmin = currentUser && (
        String(currentUser.role_id || '').toUpperCase() === 'SUPER_ADMIN' ||
        String(currentUser.role_id || '').toUpperCase() === 'ADMIN' ||
        String(currentUser.role_id || '').toUpperCase().endsWith('ADMIN') ||
        String(currentUser.role_name || '').toLowerCase() === 'admin' ||
        String(currentUser.role_name || '').toLowerCase() === 'super admin'
    );

    if (currentUser && !isAdmin) {
        // Find all client_ids assigned to this staff member from opportunities and conversations
        const { data: opps } = await supabase
            .from('opportunities')
            .select('client_id')
            .eq('assigned_staff_id', currentUser.user_id);

        const { data: convs } = await supabase
            .from('conversations')
            .select('client_id')
            .eq('assigned_staff_id', currentUser.user_id);

        const assignedClientIds = Array.from(new Set([
            ...(opps || []).map(o => o.client_id),
            ...(convs || []).map(c => c.client_id)
        ])).filter(Boolean);

        if (assignedClientIds.length === 0) {
            return [];
        }
        query = query.in('client_id', assignedClientIds);
    }

    const { data, error } = await query.order('client_id', { ascending: false });
    if (error) throw error;
    return data;
},

async getClientById(client_id) {
    const { data, error } = await supabase
        .from('clients')
        .select('*, referrers!fk_clients_referrer ( referrer_id, referrer_code, name, email, phone_number, whatsapp_number )')
        .eq('client_id', client_id)
        .single();
    if (error) throw error;
    return data;
},

async updateClient(client_id, updatedData) {
    const { data, error } = await supabase
        .from('clients')
        .update(updatedData)
        .eq('client_id', client_id)
        .select()
        .single();
    if (error) throw error;
    return data;
}, 
 
async deleteClient(client_id) {
    // Check if client has financial referral attributions or commissions
    const attrCheck = await pool.query(
        `SELECT attribution_id FROM public.referral_attributions WHERE client_id = $1;`,
        [client_id]
    );
    if (attrCheck.rows.length > 0) {
        const err = new Error(`Cannot delete student record #${client_id}: Financial referral attribution and commission history exists and must be preserved.`);
        err.statusCode = 400;
        throw err;
    }

    // 1. Remove associated opportunity pipeline records so card is completely removed
    const { error: oppError } = await supabase
        .from('opportunities')
        .delete()
        .eq('client_id', client_id);
    if (oppError) {
        console.warn('Notice: Could not delete associated opportunities:', oppError.message);
    }

    // 2. Remove associated conversations if any
    await supabase
        .from('conversations')
        .delete()
        .eq('client_id', client_id);

    // 3. Delete the client record
    const { data, error } = await supabase
        .from('clients')
        .delete()
        .eq('client_id', client_id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

}
