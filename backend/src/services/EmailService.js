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
     * Send welcome email with temporary password & reset password link to newly registered user
     */
    async sendWelcomeCredentialsEmail({ to, name, tempPassword, roleName = 'Staff', resetPasswordUrl }) {
        if (!to) {
            throw new Error('A recipient email address is required.');
        }

        const displayName = name ? name.trim() : 'User';
        const formattedRole = String(roleName || 'Staff Member').replace(/^EDUGATE_/, '');
        const subject = `Welcome to EDUGATE CRM - Your Temporary Login Credentials`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to EDUGATE CRM</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                EDUGATE GLOBAL CRM
              </h1>
              <p style="margin: 6px 0 0 0; color: #bfdbfe; font-size: 13px; font-weight: 500;">
                System Account Notification
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 30px;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
                Hello ${displayName},
              </h2>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                You have been added as an authorized user to the <strong>EDUGATE CRM</strong> platform. Your account has been provisioned with the temporary credentials below.
              </p>

              <!-- Credentials Box -->
              <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 20px;">
                    <div style="margin-bottom: 12px;">
                      <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Username / Email</span>
                      <span style="display: block; font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 3px; font-family: monospace;">${to}</span>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Temporary Password</span>
                      <span style="display: inline-block; font-size: 15px; font-weight: 700; color: #1e3a8a; background-color: #dbeafe; padding: 4px 10px; border-radius: 6px; margin-top: 4px; font-family: monospace; letter-spacing: 1px; border: 1px solid #bfdbfe;">${tempPassword}</span>
                    </div>
                    <div>
                      <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Assigned Role</span>
                      <span style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-top: 3px;">${formattedRole}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Notice -->
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 13px; line-height: 1.6;">
                This is your temporary password. For security reasons, please change your password upon your first login using the button below:
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${resetPasswordUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 4px rgba(37,99,235,0.25);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link Fallback -->
              <div style="border-top: 1px solid #f1f5f9; padding-top: 18px;">
                <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px;">
                  If the button above does not work, copy and paste this link into your web browser:
                </p>
                <a href="${resetPasswordUrl}" target="_blank" style="color: #2563eb; font-size: 12px; word-break: break-all; text-decoration: underline;">
                  ${resetPasswordUrl}
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.5;">
                © ${new Date().getFullYear()} EDUGATE Global CRM. All rights reserved.<br/>
                If you did not expect this invitation, please contact your system administrator immediately.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        const plainText = `Hello ${displayName},\n\nYou have been added as an authorized user to the EDUGATE CRM.\n\nHere are your login credentials:\nEmail: ${to}\nTemporary Password: ${tempPassword}\nAssigned Role: ${formattedRole}\n\nThis is your temporary password. Please reset your password by opening the following link:\n${resetPasswordUrl}\n\nThank you,\nEDUGATE Global CRM Team`;

        return await this.sendEmail({
            to,
            subject,
            content: plainText,
            html
        });
    }

    /**
     * Send email notification when user's email or role is updated, with new temporary password & reset password link
     */
    async sendAccountUpdatedCredentialsEmail({ to, name, tempPassword, roleName, reason, resetPasswordUrl }) {
        if (!to) {
            throw new Error('A recipient email address is required.');
        }

        const displayName = name ? name.trim() : 'User';
        const formattedRole = String(roleName || 'Staff Member').replace(/^EDUGATE_/, '');
        const subject = `EDUGATE CRM - Account Credentials & Role Update`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EDUGATE CRM - Account Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                EDUGATE GLOBAL CRM
              </h1>
              <p style="margin: 6px 0 0 0; color: #93c5fd; font-size: 13px; font-weight: 500;">
                Account Information Updated
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 30px;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
                Hello ${displayName},
              </h2>
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Your account details on the <strong>EDUGATE CRM</strong> system have recently been updated by a system administrator.
              </p>

              <!-- Reason Box -->
              <table role="presentation" width="100%" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; margin-bottom: 24px;" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 14px 18px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #1e40af; letter-spacing: 0.5px; margin-bottom: 4px;">
                      Reason for Update
                    </div>
                    <div style="font-size: 13px; font-weight: 600; color: #1e3a8a; line-height: 1.5;">
                      ${reason} As a security requirement, a new temporary password has been set for your account.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Credentials Box -->
              <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 20px;">
                    <div style="margin-bottom: 12px;">
                      <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Registered Email Address</span>
                      <span style="display: block; font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 3px; font-family: monospace;">${to}</span>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">New Temporary Password</span>
                      <span style="display: inline-block; font-size: 15px; font-weight: 700; color: #1e3a8a; background-color: #dbeafe; padding: 4px 10px; border-radius: 6px; margin-top: 4px; font-family: monospace; letter-spacing: 1px; border: 1px solid #bfdbfe;">${tempPassword}</span>
                    </div>
                    <div>
                      <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Assigned Role</span>
                      <span style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-top: 3px;">${formattedRole}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Notice -->
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 13px; line-height: 1.6;">
                Please log in with this new temporary password and reset your personal password immediately using the button below:
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${resetPasswordUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 4px rgba(37,99,235,0.25);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link Fallback -->
              <div style="border-top: 1px solid #f1f5f9; padding-top: 18px;">
                <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px;">
                  If the button above does not work, copy and paste this link into your web browser:
                </p>
                <a href="${resetPasswordUrl}" target="_blank" style="color: #2563eb; font-size: 12px; word-break: break-all; text-decoration: underline;">
                  ${resetPasswordUrl}
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.5;">
                © ${new Date().getFullYear()} EDUGATE Global CRM. All rights reserved.<br/>
                If you did not authorize this change, please contact your administrator immediately.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        const plainText = `Hello ${displayName},\n\nYour EDUGATE CRM account details have been updated.\n\nReason: ${reason}\n\nHere are your updated login credentials:\nEmail: ${to}\nNew Temporary Password: ${tempPassword}\nAssigned Role: ${formattedRole}\n\nPlease reset your password by opening the following link:\n${resetPasswordUrl}\n\nThank you,\nEDUGATE Global CRM Team`;

        return await this.sendEmail({
            to,
            subject,
            content: plainText,
            html
        });
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

                // Skip automated emails, system bots, or empty addresses
                const BOT_DOMAINS = [
                    'facebookmail.com', 'instagram.com', 'openai.com', 'chatgpt.com',
                    'github.com', 'google.com', 'clickup.com', 'tasks.clickup.com',
                    'mail.clickup.com', 'make.com', 'railway.app', 'namecheap.com',
                    'supabase.com', 'vercel.com', 'netlify.com', 'stripe.com', 'linkedin.com',
                    'twitter.com', 'x.com', 'discord.com', 'slack.com'
                ];

                const isBotDomain = BOT_DOMAINS.some(domain => senderAddress.endsWith(`@${domain}`) || senderAddress.includes(`.${domain}`));
                const isNoReply = senderAddress.includes('no-reply') || senderAddress.includes('noreply') || senderAddress.includes('donotreply') || senderAddress.includes('notification');

                if (!senderAddress || isBotDomain || isNoReply || senderAddress === this.user.toLowerCase()) {
                    continue;
                }

                // CRITICAL: Only sync emails from registered students/clients in CRM!
                const { data: studentClient } = await supabase
                    .from('clients')
                    .select('client_id, name, email')
                    .ilike('email', senderAddress)
                    .maybeSingle();

                if (!studentClient) {
                    // Not a registered student in the CRM, skip fetching
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
                        clientName: studentClient.name || senderName,
                        clientEmail: senderAddress,
                        content: formattedContent,
                        messageType: messageType,
                        media_url: mediaUrl
                    });
                    processedCount++;
                    console.log(`[EmailService] Ingested email from student ${studentClient.name} (${senderAddress}): "${subject}"`);
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
