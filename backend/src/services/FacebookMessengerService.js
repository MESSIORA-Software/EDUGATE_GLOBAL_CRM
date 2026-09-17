import dotenv from 'dotenv';
dotenv.config();

const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const GRAPH_API_VERSION = 'v21.0';

export const FacebookMessengerService = {
    // 1. Send outbound text / media message to client on Messenger
    async sendMessage(recipientPsid, messagePayload) {
        if (!PAGE_ACCESS_TOKEN) {
            throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN is not configured');
        }

        let bodyPayload = {
            recipient: { id: recipientPsid },
            messaging_type: 'RESPONSE',
            message: {}
        };

        if (messagePayload.media_url) {
            let mediaType = messagePayload.message_type || 'image';
            if (mediaType === 'audio') mediaType = 'audio';
            else if (mediaType === 'video') mediaType = 'video';
            else if (mediaType === 'document') mediaType = 'file';
            else mediaType = 'image';

            bodyPayload.message = {
                attachment: {
                    type: mediaType,
                    payload: {
                        url: messagePayload.media_url,
                        is_reusable: true
                    }
                }
            };
            if (messagePayload.content) {
                // If both text and media are provided, send text first or along
                bodyPayload.message.text = messagePayload.content;
            }
        } else {
            bodyPayload.message = {
                text: messagePayload.content || ''
            };
        }

        const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload)
        });

        const data = await response.json();
        if (data.error) {
            console.error('Facebook Send API Error:', data.error);
            throw new Error(`Facebook API Error: ${data.error.message}`);
        }

        return data;
    },

    // 2. Fetch Facebook User Profile details (Name, Profile Pic) by PSID
    async getUserProfile(psid) {
        try {
            const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.error) return null;
            return {
                name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Facebook User',
                profilePic: data.profile_pic
            };
        } catch (err) {
            console.error('Error fetching FB profile:', err);
            return null;
        }
    }
};
