import { MediaService } from '../services/MediaService.js';

export const MediaController = {

    // POST /api/media
    async upload(req, res, next) {
        try {
            const provider           = req.body.provider || 'supabase';
            const googleAccessToken  = req.body.google_access_token || null;

            const media = await MediaService.uploadMedia(req.user, req.file, provider, googleAccessToken);

            return res.status(201).json({
                status: 'success',
                message: 'Media uploaded successfully.',
                data: media,
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/media
    async list(req, res, next) {
        try {
            const result = await MediaService.listMedia(req.user, req.query);

            return res.status(200).json({
                status: 'success',
                total:  result.total,
                page:   result.page,
                limit:  result.limit,
                count:  result.data.length,
                data:   result.data,
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/media/:id
    async getById(req, res, next) {
        try {
            const media = await MediaService.getMedia(req.params.id);

            return res.status(200).json({
                status: 'success',
                data: media,
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/media/:id/url
    async getSignedUrl(req, res, next) {
        try {
            const googleAccessToken = req.query.google_access_token || null;
            const result = await MediaService.getSignedUrl(req.params.id, googleAccessToken);

            return res.status(200).json({
                status: 'success',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/media/:id
    async remove(req, res, next) {
        try {
            const googleAccessToken = req.body.google_access_token || null;
            const deleted = await MediaService.deleteMedia(req.user, req.params.id, googleAccessToken);

            return res.status(200).json({
                status: 'success',
                message: 'Media deleted successfully.',
                data: deleted,
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/media/google/auth
    async googleAuthUrl(req, res, next) {
        try {
            const url = await MediaService.getGoogleAuthUrl();
            return res.status(200).json({
                status: 'success',
                data: { auth_url: url },
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/media/google/callback
    // Public route — state verification is handled by Google's OAuth flow.
    // Tokens are returned to the client; the backend does NOT store refresh tokens.
    async googleCallback(req, res, next) {
        try {
            const { code, error: oauthError } = req.query;

            if (oauthError) {
                return res.status(400).json({
                    status: 'error',
                    message: `Google OAuth error: ${oauthError}`,
                });
            }

            const tokens = await MediaService.handleGoogleCallback(code);

            return res.status(200).json({
                status: 'success',
                message: 'Google Drive authorization successful. Use the access_token for Drive operations.',
                data: {
                    access_token:  tokens.access_token,
                    expiry_date:   tokens.expiry_date,
                    // refresh_token returned only so the FRONTEND can store it — never logged, never DB-stored
                    refresh_token: tokens.refresh_token ?? null,
                },
            });
        } catch (error) {
            next(error);
        }
    },
};
