import { ClientRepository } from '../repositories/ClientRepository.js';
import { pool } from '../database/dbPool.js';

export const ClientService = {

async createClient({ name, email, dob, source, referrer_id = null, referral_code = null }, currentUser = null, requestMeta = {}) {
    let resolvedCode = referral_code ? String(referral_code).trim() : null;

    // Backward-compatibility: If frontend passed referrer_id but not referral_code,
    // authoritatively look up the active referral code assigned to that referrer.
    if (!resolvedCode && referrer_id) {
        const codeRes = await pool.query(
            `SELECT code FROM public.referral_codes 
             WHERE referrer_id = $1 AND status = 'ACTIVE' 
             ORDER BY code_id DESC LIMIT 1;`,
            [Number(referrer_id)]
        );
        if (codeRes.rows.length > 0) {
            resolvedCode = codeRes.rows[0].code;
        }
    }

    return await ClientRepository.createClientWithAtomicReferral({
        name,
        email,
        dob,
        source,
        referralCode: resolvedCode,
        currentUser,
        requestMeta,
    });
},

async getAllClients(currentUser = null) {
    return await ClientRepository.getAllClients(currentUser);
},

async getClientById(client_id) {
    const client = await ClientRepository.getClientById(client_id);
    if (!client) {
        const error = new Error(`Client with ID '${client_id}' not found`);
        error.statusCode = 404;
        throw error;
    }
    return client;
},

async updateClient(client_id, { name, email, dob, source, referrer_id }) {

    await this.getClientById(client_id); // Ensure the client exists before updating

    const updatedData = {
        name: name,
        email: email,
        dob: dob,
        source: source
    };
    if (referrer_id !== undefined) {
        updatedData.referrer_id = referrer_id ? Number(referrer_id) : null;
    }
    const updatedClient = await ClientRepository.updateClient(client_id, updatedData);
    return updatedClient;
},

async deleteClient(client_id) {
    await this.getClientById(client_id); // Ensure the client exists before deleting

    const deletedClient = await ClientRepository.deleteClient(client_id);
    return deletedClient;
}

}
