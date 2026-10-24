import dotenv from 'dotenv';
dotenv.config();

const GRAPH_API_VERSION = 'v21.0';

export const FacebookMessengerService = {
    // Helper to get active page access token (reloads .env dynamically if updated)
    getToken() {
        try {
            dotenv.config({ override: true });
        } catch (_) {}
        return process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim() || null;
    },

    // 1. Send outbound text / media message to client on Messenger
    async sendMessage(recipientPsid, messagePayload) {
        const token = this.getToken();
        if (!token) {
            throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN is not configured in backend/.env');
        }
        if (!recipientPsid) {
            throw new Error('A Messenger recipient PSID is required');
        }
        if (!messagePayload?.content && !messagePayload?.media_url) {
            throw new Error('A message must contain text or media');
        }

        // Meta Send API requires: exactly ONE of 'text' or 'attachment'
        let messageObj = {};
        if (messagePayload.media_url) {
            let mediaType = messagePayload.message_type || 'image';
            if (mediaType === 'audio') mediaType = 'audio';
            else if (mediaType === 'video') mediaType = 'video';
            else if (mediaType === 'document') mediaType = 'file';
            else mediaType = 'image';

            messageObj = {
                attachment: {
                    type: mediaType,
                    payload: {
                        url: messagePayload.media_url,
                        is_reusable: true
                    }
                }
            };
        } else {
            messageObj = {
                text: messagePayload.content || ''
            };
        }

        const sendMetaRequest = async (payload) => {
            const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/me/messages?access_token=${token}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            return { ok: response.ok, status: response.status, data };
        };

        // Attempt 1: Standard 'RESPONSE' messaging type (within 24-hour standard window)
        let bodyPayload = {
            recipient: { id: recipientPsid },
            messaging_type: 'RESPONSE',
            message: messageObj
        };

        let result = await sendMetaRequest(bodyPayload);

        // If outside 24h window (code 10 / subcode 2018001), fallback to HUMAN_AGENT tag (up to 7 days)
        const isWindowError = !result.ok && (
            result.data?.error?.code === 10 ||
            result.data?.error?.error_subcode === 2018001 ||
            result.data?.error?.message?.toLowerCase().includes('outside of allowed window')
        );

        if (isWindowError) {
            console.log('[FacebookMessengerService] 24h window passed, attempting HUMAN_AGENT tag fallback...');
            const tagPayload = {
                recipient: { id: recipientPsid },
                messaging_type: 'MESSAGE_TAG',
                tag: 'HUMAN_AGENT',
                message: messageObj
            };
            result = await sendMetaRequest(tagPayload);
        }

        if (!result.ok || result.data?.error) {
            const err = result.data?.error;
            console.error('Facebook Send API Error:', err);

            if (err?.code === 190) {
                throw new Error('Facebook Page Access Token has expired or was invalidated. Please generate a new Page Access Token in Meta for Developers.');
            }
            if (err?.code === 10 || err?.error_subcode === 2018001 || err?.message?.toLowerCase().includes('outside of allowed window')) {
                throw new Error('Facebook 24-hour messaging window has passed for this recipient. Under Meta policy, the customer must send a new message before the page can respond.');
            }
            throw new Error(`Facebook API Error: ${err?.message || 'Request failed'}`);
        }

        return result.data;
    },

    // 2. Fetch Facebook User Profile details (Name, Profile Pic) by PSID
    async getUserProfile(psid) {
        try {
            const token = this.getToken();
            if (!token) return null;

            const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${psid}?fields=first_name,last_name,profile_pic&access_token=${token}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.error) {
                console.warn('[FacebookMessengerService] getUserProfile failed:', data.error.message);
                return null;
            }
            return {
                name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Facebook User',
                profilePic: data.profile_pic
            };
        } catch (err) {
            console.error('Error fetching FB profile:', err);
            return null;
        }
    },

    // 3. Check Facebook Messenger configuration and connection status
    async getStatus() {
        const token = this.getToken();
        const appSecret = process.env.FACEBOOK_APP_SECRET?.trim() || null;
        const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN?.trim() || null;

        if (!token) {
            return {
                configured: false,
                connected: false,
                hasAppSecret: !!appSecret,
                hasVerifyToken: !!verifyToken,
                error: 'FACEBOOK_PAGE_ACCESS_TOKEN is missing in backend/.env'
            };
        }

        try {
            const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/me?fields=id,name&access_token=${token}`);
            const data = await res.json();

            if (data.error) {
                return {
                    configured: true,
                    connected: false,
                    hasAppSecret: !!appSecret,
                    hasVerifyToken: !!verifyToken,
                    error: data.error.message,
                    errorCode: data.error.code,
                    errorSubcode: data.error.error_subcode
                };
            }

            return {
                configured: true,
                connected: true,
                pageId: data.id,
                pageName: data.name,
                hasAppSecret: !!appSecret,
                hasVerifyToken: !!verifyToken
            };
        } catch (e) {
            return {
                configured: true,
                connected: false,
                hasAppSecret: !!appSecret,
                hasVerifyToken: !!verifyToken,
                error: e.message
            };
        }
    }
};
