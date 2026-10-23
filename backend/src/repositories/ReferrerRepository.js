import { supabase } from '../database/supabaseClient.js';

export const ReferrerRepository = {
  async getNextReferrerCode() {
    const { data, error } = await supabase
      .from('referrers')
      .select('referrer_code')
      .order('referrer_id', { ascending: false });

    if (error) throw error;

    let maxNum = 0;
    if (data && data.length > 0) {
      data.forEach((item) => {
        if (item.referrer_code) {
          const match = item.referrer_code.match(/EDUGATE_REFERRER_(\d+)/i);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        }
      });
    }

    const nextNum = maxNum + 1;
    const formattedNum = String(nextNum).padStart(2, '0');
    return `EDUGATE_REFERRER_${formattedNum}`;
  },

  async createReferrer(referrerData) {
    if (!referrerData.referrer_code) {
      referrerData.referrer_code = await this.getNextReferrerCode();
    }

    const { data, error } = await supabase
      .from('referrers')
      .insert([referrerData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllReferrers() {
    const { data, error } = await supabase
      .from('referrers')
      .select('*')
      .order('referrer_id', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getReferrerById(referrerId) {
    const { data, error } = await supabase
      .from('referrers')
      .select('*')
      .eq('referrer_id', referrerId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateReferrer(referrerId, updateData) {
    const { data, error } = await supabase
      .from('referrers')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('referrer_id', referrerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteReferrer(referrerId) {
    const { data, error } = await supabase
      .from('referrers')
      .delete()
      .eq('referrer_id', referrerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getStudentsByReferrerId(referrerId) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('referrer_id', referrerId)
      .order('client_id', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
