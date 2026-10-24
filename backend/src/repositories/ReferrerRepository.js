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
    const { data: referrers, error } = await supabase
      .from('referrers')
      .select('*')
      .order('referrer_id', { ascending: false });

    if (error) throw error;
    if (!referrers || referrers.length === 0) return [];

    // Also fetch clients and payouts to compute payment status for each referrer
    const { data: clients } = await supabase
      .from('clients')
      .select('client_id, referrer_id, created_at');

    const { data: payouts } = await supabase
      .from('referrer_payouts')
      .select('referrer_id, amount, paid_at');

    const clientCountMap = {};
    (clients || []).forEach((c) => {
      if (c.referrer_id) {
        clientCountMap[c.referrer_id] = (clientCountMap[c.referrer_id] || 0) + 1;
      }
    });

    const payoutSumMap = {};
    (payouts || []).forEach((p) => {
      if (p.referrer_id) {
        payoutSumMap[p.referrer_id] = (payoutSumMap[p.referrer_id] || 0) + Number(p.amount || 0);
      }
    });

    return referrers.map((ref) => {
      const studentCount = clientCountMap[ref.referrer_id] || 0;
      const rate = Number(ref.payment_per_student) || 1000;
      const totalPayable = studentCount * rate;
      const totalPaid = payoutSumMap[ref.referrer_id] || 0;
      const pendingAmount = Math.max(0, totalPayable - totalPaid);

      let paymentStatus = 'No Due';
      if (totalPayable > 0) {
        if (pendingAmount === 0) {
          paymentStatus = 'Paid';
        } else if (totalPaid > 0) {
          paymentStatus = 'Partially Paid';
        } else {
          paymentStatus = 'Pending Payment';
        }
      } else if (totalPaid > 0) {
        paymentStatus = 'Paid';
      } else {
        paymentStatus = 'No Due';
      }

      return {
        ...ref,
        student_count: studentCount,
        total_payable: totalPayable,
        total_paid: totalPaid,
        pending_amount: pendingAmount,
        payment_status: paymentStatus,
      };
    });
  },

  async getReferrerById(referrerId) {
    const { data, error } = await supabase
      .from('referrers')
      .select('*')
      .eq('referrer_id', referrerId)
      .maybeSingle();

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

  async getPaymentSettings() {
    try {
      const { data, error } = await supabase
        .from('referrer_settings')
        .select('*')
        .eq('key', 'payment_settings')
        .maybeSingle();

      if (error || !data) {
        return { rate_per_student: 1000, currency: 'LKR' };
      }
      return data.value || { rate_per_student: 1000, currency: 'LKR' };
    } catch {
      return { rate_per_student: 1000, currency: 'LKR' };
    }
  },

  async updatePaymentSettings({ rate_per_student, currency = 'LKR', apply_to_all = false }) {
    const cleanRate = Number(rate_per_student) || 1000;
    const settingsValue = {
      rate_per_student: cleanRate,
      currency: currency || 'LKR',
    };

    // 1. Upsert into referrer_settings
    const { data, error } = await supabase
      .from('referrer_settings')
      .upsert({
        key: 'payment_settings',
        value: settingsValue,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' })
      .select()
      .single();

    if (error) throw error;

    // 2. If apply_to_all is requested, update all referrers in the database
    if (apply_to_all) {
      await supabase
        .from('referrers')
        .update({
          payment_per_student: cleanRate,
          updated_at: new Date().toISOString(),
        })
        .neq('referrer_id', 0);
    }

    return settingsValue;
  },

  async getPayoutsByReferrerId(referrerId) {
    const { data, error } = await supabase
      .from('referrer_payouts')
      .select('*')
      .eq('referrer_id', referrerId)
      .order('paid_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createPayout({ referrer_id, amount, payment_method, reference_note, paid_by }) {
    const { data, error } = await supabase
      .from('referrer_payouts')
      .insert([{
        referrer_id: Number(referrer_id),
        amount: Number(amount),
        payment_method: payment_method || 'Bank Transfer',
        reference_note: reference_note || null,
        paid_by: paid_by ? Number(paid_by) : null,
        paid_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
