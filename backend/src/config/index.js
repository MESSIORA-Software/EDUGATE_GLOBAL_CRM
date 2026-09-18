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
};
