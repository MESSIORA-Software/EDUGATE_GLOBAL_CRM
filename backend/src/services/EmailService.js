import nodemailer from 'nodemailer';
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { config } from '../config/index.js';
import { supabase } from '../database/supabaseClient.js';
import { ConversationService } from './ConversationService.js';
import { ConversationRepository } from '../repositories/ConversationRepository.js';

class EmailManager {
    constructor() {
        this.user = config.email?.user || process.env.GMAIL_USER || 'messiorasolutions@gmail.com';
        this.pass = config.email?.appPassword || process.env.GMAIL_APP_PASSWORD || '';
        this.isPolling = false;
        this.pollInterval = null;
        this.lastChecked = null;
    }

    /**
     * Get Nodemailer SMTP transporter
     */
    getTransporter() {
        const user = config.email?.user || process.env.GMAIL_USER || this.user;
        const pass = (config.email?.appPassword || process.env.GMAIL_APP_PASSWORD || this.pass).replace(/\s+/g, '');

        if (!user || !pass) {
            throw new Error('Gmail is not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env');
        }

        return nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
            tls: { rejectUnauthorized: false }
        });
    }

    /**
     * Get IMAP connection configuration for Gmail
     */
    getImapConfig() {
        const user = config.email?.user || process.env.GMAIL_USER || this.user;
        const pass = (config.email?.appPassword || process.env.GMAIL_APP_PASSWORD || this.pass).replace(/\s+/g, '');

        return {
            imap: {
                user,
                password: pass,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                tlsOptions: { rejectUnauthorized: false },
                authTimeout: 30000,
                connTimeout: 30000
            }
        };
    }

    /**
     * Test connection to Gmail SMTP & IMAP
     */
    async testConnection() {
        try {
            const transporter = this.getTransporter();
            await transporter.verify();
            return {
                connected: true,
                email: this.user,
                message: 'Gmail SMTP & IMAP connected successfully'
            };
        } catch (error) {
            console.error('[EmailService] Connection test failed:', error);
            return {
                connected: false,
                email: this.user,
                error: error.message || 'Failed to authenticate with Gmail'
            };
        }
    }

    /**
     * Send an email to a customer
     * @param {object} params - { to, cc, bcc, subject, content, html, media_url, attachments }
     */
    async sendEmail({ to, cc, bcc, subject, content, html, media_url, attachments = [] }) {
        if (!to) {
            throw new Error('A recipient email address is required.');
        }

        const transporter = this.getTransporter();
        const user = config.email?.user || process.env.GMAIL_USER || this.user;

        const mailOptions = {
            from: `"Edugate Global CRM" <${user}>`,
            to: to.trim(),
            subject: subject?.trim() || 'Message from Edugate Global CRM',
            text: content || '',
            html: html || (content ? `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">${content.replace(/\n/g, '<br/>')}</div>` : undefined)
        };

        if (cc && cc.trim()) {
            mailOptions.cc = cc.trim();
        }
        if (bcc && bcc.trim()) {
            mailOptions.bcc = bcc.trim();
        }

        const emailAttachments = [...attachments];
        if (media_url) {
            emailAttachments.push({ path: media_url });
        }
        if (emailAttachments.length > 0) {
            mailOptions.attachments = emailAttachments;
        }

        const result = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Outbound email sent to ${to}, messageId: ${result.messageId}`);
        return result;
    }

    /**
     * Fetch incoming emails from Gmail inbox via IMAP
     */
    async syncIncomingEmails() {
        if (this.isPolling) {
            console.log('[EmailService] Email sync already in progress, skipping...');
            return { processedCount: 0 };
        }

        this.isPolling = true;
        let connection = null;
        let processedCount = 0;

        try {
            const imapConfig = this.getImapConfig();
            connection = await imaps.connect(imapConfig);
            
            // Attach error listener to underlying imap client to prevent unhandled socket ECONNRESET crash
            if (connection && connection.imap) {
                connection.imap.on('error', (err) => {
                    console.warn('[EmailService] IMAP background socket error (caught):', err?.message || err);
                });
            }

            await connection.openBox('INBOX');

            // Fetch the last 25 emails from the inbox
            const searchCriteria = ['ALL'];
            const fetchOptions = {
                bodies: ['HEADER', ''],
                markSeen: false
            };

            const allMessages = await connection.search(searchCriteria, fetchOptions);
            const recentMessages = allMessages.slice(-25);
            console.log(`[EmailService] Processing last ${recentMessages.length} email(s) from inbox...`);

            for (const item of recentMessages) {
                const all = item.parts.find(part => part.which === '');
                if (!all || !all.body) continue;

                const parsed = await simpleParser(all.body);

                const senderAddress = parsed.from?.value?.[0]?.address?.toLowerCase()?.trim();
                const senderName = parsed.from?.value?.[0]?.name || senderAddress;
                const subject = parsed.subject || '(No Subject)';
                const bodyText = (parsed.text || parsed.textAsHtml || parsed.html || '').trim();

                // Skip automated emails from google or empty addresses
                if (!senderAddress || senderAddress.includes('no-reply@') || senderAddress === this.user.toLowerCase()) {
                    continue;
                }

                // Format content for display in thread
                const formattedContent = subject
                    ? `[Subject: ${subject}]\n\n${bodyText}`
                    : bodyText;

                // Step 1: Check or create conversation
                let conversation = await ConversationRepository.findByChannelAndClientId('email', senderAddress);

                // Step 2: Upload attachment to Supabase Storage if present
                let mediaUrl = null;
                let messageType = 'text';

                if (parsed.attachments && parsed.attachments.length > 0) {
                    const att = parsed.attachments[0];
                    const fileExt = att.filename ? att.filename.split('.').pop() : 'bin';
                    const fileName = `email_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const filePath = `uploads/${fileName}`;

                    try {
                        const { error: uploadErr } = await supabase.storage
                            .from('conversation-media')
                            .upload(filePath, att.content, {
                                contentType: att.contentType || 'application/octet-stream',
                                upsert: false
                            });

                        if (!uploadErr) {
                            const { data: urlData } = supabase.storage
                                .from('conversation-media')
                                .getPublicUrl(filePath);
                            mediaUrl = urlData?.publicUrl || null;
                            messageType = att.contentType?.startsWith('image/') ? 'image' : 'document';
                        }
                    } catch (e) {
                        console.error('[EmailService] Attachment upload error:', e);
                    }
                }

                // Step 3: Deduplication check - if already saved, don't duplicate
                if (conversation) {
                    const { data: existing } = await supabase
                        .from('messages')
                        .select('message_id')
                        .eq('conversation_id', conversation.conversation_id)
                        .eq('content', formattedContent)
                        .maybeSingle();

                    if (existing) {
                        continue; // Already processed
                    }
                }

                // Step 4: Ingest into CRM (messageType must be 'text' or 'document' or 'image' to satisfy check constraint)
                try {
                    await ConversationService.handleInboundCommunication({
                        channel: 'email',
                        channelClientId: senderAddress,
                        clientName: senderName,
                        clientEmail: senderAddress,
                        content: formattedContent,
                        messageType: messageType,
                        media_url: mediaUrl
                    });
                    processedCount++;
                    console.log(`[EmailService] Ingested email from ${senderAddress}: "${subject}"`);
                } catch (saveError) {
                    console.error('[EmailService] Error saving inbound email:', saveError);
                }
            }

            this.lastChecked = new Date();
        } catch (error) {
            console.error('[EmailService] Error fetching incoming emails via IMAP:', error);
        } finally {
            if (connection) {
                try {
                    connection.end();
                } catch (e) {
                    // ignore
                }
            }
            this.isPolling = false;
        }

        return { processedCount, lastChecked: this.lastChecked };
    }

    /**
     * Start automatic periodic polling for new emails (every 60 seconds)
     */
    startAutoPolling(intervalMs = 60000) {
        if (this.pollInterval) return;
        console.log(`[EmailService] Starting auto-polling for Gmail every ${intervalMs / 1000}s`);
        setTimeout(() => this.syncIncomingEmails(), 2000);
        this.pollInterval = setInterval(() => {
            this.syncIncomingEmails();
        }, intervalMs);
    }

    /**
     * Stop auto-polling
     */
    stopAutoPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }
}

export const EmailService = new EmailManager();

// Automatically start background email listener
EmailService.startAutoPolling(60000);
