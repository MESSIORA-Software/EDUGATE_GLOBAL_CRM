import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    databaseUrl: process.env.DATABASE_URL,

    // Module 8 — Media Storage
    media: {
        bucket: process.env.MEDIA_BUCKET || 'crm-media',
        maxFileSizeBytes: parseInt(process.env.MEDIA_MAX_FILE_SIZE_BYTES) || 20 * 1024 * 1024, // 20 MB
        signedUrlExpirySeconds: parseInt(process.env.MEDIA_SIGNED_URL_EXPIRY_SECONDS) || 3600,
    },

    // Module 8 — Google Drive (all fields optional; feature is disabled when absent)
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || null,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
        redirectUri: process.env.GOOGLE_REDIRECT_URI || null,
        driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || null,
    },

    // Stable role IDs (user_roles.role_id) treated as administrators.
    roles: {
        adminRoleIds: ['MANAGER', 'SUPER_ADMIN', 'EDUGATE_SUPER_ADMIN', 'EDUGATE_ADMIN', 'ADMIN'],
    },

    // Module 11 — Notifications. The worker endpoint is disabled (503) unless
    // NOTIFICATION_WORKER_SECRET (>= 32 chars) and the service-role key are set.
    notifications: {
        workerSecret: process.env.NOTIFICATION_WORKER_SECRET || null,
        batchSize: Math.min(Math.max(parseInt(process.env.NOTIFICATION_BATCH_SIZE) || 50, 1), 200),
        maxRoundsPerRun: Math.min(Math.max(parseInt(process.env.NOTIFICATION_MAX_ROUNDS) || 4, 1), 10),
        timeBudgetMs: parseInt(process.env.NOTIFICATION_TIME_BUDGET_MS) || 8000,
        leaseSeconds: Math.max(parseInt(process.env.NOTIFICATION_LEASE_SECONDS) || 120, 30),
        retryBaseSeconds: 30,
        retryMaxSeconds: 3600,
    },

    // Messenger webhook signature verification (X-Hub-Signature-256) & API credentials
    facebook: {
        appSecret: process.env.FACEBOOK_APP_SECRET || null,
        pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || null,
        verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || null,
    },

    // WhatsApp Cloud API & Webhook verification
    whatsapp: {
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || null,
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN || null,
        verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || process.env.FACEBOOK_VERIFY_TOKEN || null,
        appSecret: process.env.WHATSAPP_APP_SECRET || process.env.FACEBOOK_APP_SECRET || null,
        apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
    },

    // Gmail Email Channel Config
    email: {
        user: process.env.GMAIL_USER || 'messiorasolutions@gmail.com',
        appPassword: process.env.GMAIL_APP_PASSWORD || '',
    },
};
