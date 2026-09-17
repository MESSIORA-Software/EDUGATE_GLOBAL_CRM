import { MobileSyncService } from '../services/MobileSyncService.js';

export const MobileSyncController = {
    // POST /api/mobile/sync-calls
    async syncCalls(req, res, next) {
        try {
            const { calls } = req.body;
            if (!Array.isArray(calls)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "calls" must be an array of call logs.'
                });
            }
            const result = await MobileSyncService.syncCallLogs(req.user, calls);
            res.status(200).json({
                status: 'success',
                message: `Synced ${result.synced_count} call log(s) successfully.`,
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/mobile/sync-sms
    async syncSms(req, res, next) {
        try {
            const { sms_list } = req.body;
            if (!Array.isArray(sms_list)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "sms_list" must be an array of SMS messages.'
                });
            }
            const result = await MobileSyncService.syncSmsMessages(req.user, sms_list);
            res.status(200).json({
                status: 'success',
                message: `Synced ${result.synced_count} SMS record(s) successfully.`,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
};
