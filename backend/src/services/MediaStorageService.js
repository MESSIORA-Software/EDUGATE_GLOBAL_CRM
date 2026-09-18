import { supabase } from '../database/supabaseClient.js';
import { config } from '../config/index.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true when all required Google Drive env vars are present.
 * Never throws — used as a guard before any Drive operation.
 */
function isGoogleDriveConfigured() {
    return !!(config.google.clientId && config.google.clientSecret && config.google.redirectUri);
}

/**
 * Lazily constructs an OAuth2 client.  We do NOT import googleapis at module
 * load time so that the backend starts without error even when the package is
 * not yet installed or credentials are absent.
 * @returns {import('googleapis').Auth.OAuth2Client}
 */
async function getOAuth2Client(accessToken = null) {
    const { google } = await import('googleapis');
    const client = new google.auth.OAuth2(
        config.google.clientId,
        config.google.clientSecret,
        config.google.redirectUri,
    );
    if (accessToken) {
        client.setCredentials({ access_token: accessToken });
    }
    return client;
}

// ─── Supabase Storage Provider ────────────────────────────────────────────────

export const MediaStorageService = {

    // ── Supabase ──────────────────────────────────────────────────────────────

    /**
     * Upload a file buffer to Supabase Storage.
     * The bucket is expected to be private (configured in Supabase dashboard).
     *
     * @param {Buffer}  buffer      - File content
     * @param {string}  storagePath - Object path within the bucket (e.g. "image/2026/09/<uuid>.jpg")
     * @param {string}  mimeType    - Content-Type header value
     * @returns {Promise<void>}
     */
    async uploadToSupabase(buffer, storagePath, mimeType) {
        const { error } = await supabase.storage
            .from(config.media.bucket)
            .upload(storagePath, buffer, {
                contentType: mimeType,
                upsert: false,
            });

        if (error) throw error;
    },

    /**
     * Generate a time-limited signed URL for a Supabase Storage object.
     * The URL is valid for `expiresIn` seconds (default from config).
     *
     * @param {string}  storagePath - Object path within the bucket
     * @param {number}  [expiresIn] - Seconds until expiry
     * @returns {Promise<string>}   - Signed URL
     */
    async getSupabaseSignedUrl(storagePath, expiresIn = config.media.signedUrlExpirySeconds) {
        const { data, error } = await supabase.storage
            .from(config.media.bucket)
            .createSignedUrl(storagePath, expiresIn);

        if (error) throw error;
        return data.signedUrl;
    },

    /**
     * Delete an object from Supabase Storage.
     *
     * @param {string} storagePath - Object path within the bucket
     * @returns {Promise<void>}
     */
    async deleteFromSupabase(storagePath) {
        const { error } = await supabase.storage
            .from(config.media.bucket)
            .remove([storagePath]);

        if (error) throw error;
    },

    // ── Google Drive ──────────────────────────────────────────────────────────

    /**
     * Returns true when Google Drive is configured.
     * Used by MediaService to guard Drive-specific requests.
     */
    isGoogleDriveConfigured,

    /**
     * Generate the Google OAuth2 authorization URL.
     * @returns {string} Authorization URL to redirect the user to
     */
    async getGoogleAuthUrl() {
        if (!isGoogleDriveConfigured()) {
            const err = new Error('Google Drive is not configured on this server.');
            err.statusCode = 503;
            throw err;
        }

        const oauth2Client = await getOAuth2Client();
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/drive.file'],
            prompt: 'consent',
        });
    },

    /**
     * Exchange an OAuth2 authorization code for tokens.
     * @param {string} code - Authorization code from Google callback
     * @returns {{ access_token, refresh_token, expiry_date }}
     */
    async exchangeGoogleCode(code) {
        if (!isGoogleDriveConfigured()) {
            const err = new Error('Google Drive is not configured on this server.');
            err.statusCode = 503;
            throw err;
        }

        const oauth2Client = await getOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);
        return tokens;
    },

    /**
     * Upload a file buffer to Google Drive.
     *
     * @param {Buffer}  buffer       - File content
     * @param {string}  originalName - Human-readable filename to store in Drive
     * @param {string}  mimeType     - Content-Type
     * @param {string}  accessToken  - OAuth2 access token for the user's Drive
     * @returns {Promise<{ fileId: string, webViewLink: string }>}
     */
    async uploadToGoogleDrive(buffer, originalName, mimeType, accessToken) {
        if (!isGoogleDriveConfigured()) {
            const err = new Error('Google Drive is not configured on this server.');
            err.statusCode = 503;
            throw err;
        }

        const { google } = await import('googleapis');
        const oauth2Client = await getOAuth2Client(accessToken);
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const { Readable } = await import('stream');
        const stream = Readable.from(buffer);

        const fileMetadata = {
            name: originalName,
            ...(config.google.driveFolderId && { parents: [config.google.driveFolderId] }),
        };

        const media = { mimeType, body: stream };

        const { data } = await drive.files.create({
            requestBody: fileMetadata,
            media,
            fields: 'id, webViewLink',
        });

        return { fileId: data.id, webViewLink: data.webViewLink };
    },

    /**
     * Generate a time-limited download URL for a Google Drive file.
     * Uses the Drive v3 `files.get` with `?alt=media` — the access token
     * provides time-bound authorization.  We return a metadata URL + token
     * so the client can download directly from Drive without proxying through
     * Express.
     *
     * @param {string} fileId      - Google Drive file ID
     * @param {string} accessToken - OAuth2 access token
     * @returns {Promise<string>}  - Temporary download URL
     */
    async getGoogleDriveDownloadUrl(fileId, accessToken) {
        if (!isGoogleDriveConfigured()) {
            const err = new Error('Google Drive is not configured on this server.');
            err.statusCode = 503;
            throw err;
        }

        // The download URL is time-limited by the access token expiry (~1 hour).
        return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${accessToken}`;
    },

    /**
     * Delete a file from Google Drive.
     *
     * @param {string} fileId      - Google Drive file ID
     * @param {string} accessToken - OAuth2 access token
     * @returns {Promise<void>}
     */
    async deleteFromGoogleDrive(fileId, accessToken) {
        if (!isGoogleDriveConfigured()) {
            const err = new Error('Google Drive is not configured on this server.');
            err.statusCode = 503;
            throw err;
        }

        const { google } = await import('googleapis');
        const oauth2Client = await getOAuth2Client(accessToken);
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        await drive.files.delete({ fileId });
    },
};
