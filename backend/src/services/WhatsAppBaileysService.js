import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { ConversationService } from './ConversationService.js';

class WhatsAppBaileysManager {
    constructor() {
        this.sock = null;
        this.connectionStatus = 'disconnected'; // 'disconnected' | 'connecting' | 'qr_ready' | 'connected'
        this.currentQrCode = null;
        this.connectedUser = null;
        this.sessionDir = path.join(process.cwd(), 'whatsapp_session');
        this.isInitializing = false;
        this.autoReconnect = true;
    }

    /**
     * Get current status and QR code
     */
    getStatus() {
        return {
            status: this.connectionStatus,
            qrCode: this.currentQrCode,
            user: this.connectedUser,
            phoneNumber: this.connectedUser?.id ? this.connectedUser.id.split(':')[0].replace(/[^0-9]/g, '') : null,
            name: this.connectedUser?.name || null
        };
    }

    /**
     * Start/Initialize WhatsApp Web socket connection
     */
    async initialize() {
        if (this.isInitializing || this.connectionStatus === 'connected') {
            return this.getStatus();
        }

        this.isInitializing = true;
        this.connectionStatus = 'connecting';

        try {
            if (!fs.existsSync(this.sessionDir)) {
                fs.mkdirSync(this.sessionDir, { recursive: true });
            }

            const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);
            const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

            const logger = pino({ level: 'silent' });

            this.sock = makeWASocket({
                version,
                auth: state,
                logger,
                printQRInTerminal: false,
                browser: ['Edugate Global CRM', 'Chrome', '120.0.0'],
                syncFullHistory: false
            });

            this.sock.ev.on('creds.update', saveCreds);

            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    try {
                        this.currentQrCode = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
                        this.connectionStatus = 'qr_ready';
                        console.log('[WhatsApp Linked Device] New QR code generated. Ready for scanning.');
                    } catch (qrErr) {
                        console.error('[WhatsApp Linked Device] Failed to render QR code:', qrErr);
                    }
                }

                if (connection === 'close') {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                    console.log(`[WhatsApp Linked Device] Connection closed due to:`, lastDisconnect?.error, `, reconnecting: ${shouldReconnect}`);

                    this.connectionStatus = 'disconnected';
                    this.currentQrCode = null;

                    if (shouldReconnect && this.autoReconnect) {
                        this.isInitializing = false;
                        setTimeout(() => this.initialize(), 3000);
                    } else {
                        // Logged out
                        this.connectedUser = null;
                        this.isInitializing = false;
                        try {
                            fs.rmSync(this.sessionDir, { recursive: true, force: true });
                        } catch (e) {
                            console.error('Failed to clear session dir:', e);
                        }
                    }
                } else if (connection === 'open') {
                    this.connectionStatus = 'connected';
                    this.currentQrCode = null;
                    this.connectedUser = this.sock.user;
                    this.isInitializing = false;
                    console.log('[WhatsApp Linked Device] Connected successfully as:', this.sock.user?.id);
                }
            });

            // Listen for incoming messages
            this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
                if (type !== 'notify') return;

                for (const msg of messages) {
                    if (!msg.message || msg.key.fromMe) continue;

                    const remoteJid = msg.key.remoteJid;
                    if (!remoteJid || remoteJid.endsWith('@g.us') || remoteJid === 'status@broadcast') {
                        continue; // Skip group chats and status broadcasts
                    }

                    const senderPhone = remoteJid.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');
                    const clientName = msg.pushName || `WhatsApp User (+${senderPhone})`;

                    let content = '';
                    let messageType = 'text';

                    if (msg.message.conversation) {
                        content = msg.message.conversation;
                    } else if (msg.message.extendedTextMessage?.text) {
                        content = msg.message.extendedTextMessage.text;
                    } else if (msg.message.imageMessage) {
                        messageType = 'image';
                        content = msg.message.imageMessage.caption || '[Sent image]';
                    } else if (msg.message.documentMessage) {
                        messageType = 'document';
                        content = msg.message.documentMessage.fileName || msg.message.documentMessage.caption || '[Sent document]';
                    } else if (msg.message.audioMessage) {
                        messageType = 'audio';
                        content = '[Voice note / Audio]';
                    } else if (msg.message.videoMessage) {
                        messageType = 'video';
                        content = msg.message.videoMessage.caption || '[Sent video]';
                    } else {
                        content = '[WhatsApp message]';
                    }

                    try {
                        await ConversationService.handleInboundCommunication({
                            channel: 'whatsapp',
                            channelClientId: senderPhone,
                            clientName: clientName,
                            content: content,
                            messageType: messageType
                        });
                        console.log(`[WhatsApp Linked Device] Received message from ${senderPhone}: "${content}"`);
                    } catch (error) {
                        console.error('[WhatsApp Linked Device] Error processing incoming message:', error);
                    }
                }
            });

        } catch (error) {
            console.error('[WhatsApp Linked Device] Initialization error:', error);
            this.connectionStatus = 'disconnected';
            this.isInitializing = false;
        }

        return this.getStatus();
    }

    /**
     * Send outbound message to a WhatsApp user
     */
    async sendMessage(recipientPhone, { content, media_url, message_type = 'text' }) {
        if (this.connectionStatus !== 'connected' || !this.sock) {
            throw new Error('WhatsApp is not connected. Please scan the QR code in the CRM to connect your WhatsApp Business account.');
        }

        const cleanPhone = recipientPhone.toString().replace(/[^0-9]/g, '');
        if (!cleanPhone) {
            throw new Error('A valid recipient phone number is required.');
        }

        const jid = `${cleanPhone}@s.whatsapp.net`;

        if (media_url) {
            if (message_type === 'image') {
                return await this.sock.sendMessage(jid, { image: { url: media_url }, caption: content || '' });
            } else if (message_type === 'video') {
                return await this.sock.sendMessage(jid, { video: { url: media_url }, caption: content || '' });
            } else if (message_type === 'audio') {
                return await this.sock.sendMessage(jid, { audio: { url: media_url }, mimetype: 'audio/mp4' });
            } else {
                return await this.sock.sendMessage(jid, {
                    document: { url: media_url },
                    mimetype: 'application/octet-stream',
                    fileName: 'attachment'
                });
            }
        } else {
            return await this.sock.sendMessage(jid, { text: content });
        }
    }

    /**
     * Disconnect / Log out
     */
    async logout() {
        this.autoReconnect = false;
        try {
            if (this.sock) {
                await this.sock.logout().catch(() => {});
                this.sock.end(new Error('User logged out'));
            }
        } catch (e) {
            console.error('Error during logout:', e);
        }

        this.connectionStatus = 'disconnected';
        this.currentQrCode = null;
        this.connectedUser = null;
        this.isInitializing = false;

        try {
            fs.rmSync(this.sessionDir, { recursive: true, force: true });
        } catch (e) {
            console.error('Failed to remove session directory:', e);
        }

        this.autoReconnect = true;
        return { status: 'disconnected' };
    }
}

export const WhatsAppBaileysService = new WhatsAppBaileysManager();
