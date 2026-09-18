import multer from 'multer';
import { config } from '../config/index.js';

// ─── Allowed MIME types ───────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Text
    'text/plain', 'text/csv',
    // Archives
    'application/zip',
    // Audio / Video
    'audio/mpeg', 'audio/mp4', 'video/mp4', 'video/mpeg', 'video/quicktime',
]);

// ─── Magic-byte signatures ────────────────────────────────────────────────────
// Each entry: { mime, offset, signature } where signature is a Buffer prefix.
const MAGIC_SIGNATURES = [
    { mime: 'image/jpeg', offset: 0, signature: Buffer.from([0xff, 0xd8, 0xff]) },
    { mime: 'image/png',  offset: 0, signature: Buffer.from([0x89, 0x50, 0x4e, 0x47]) },
    { mime: 'image/gif',  offset: 0, signature: Buffer.from([0x47, 0x49, 0x46, 0x38]) },
    { mime: 'image/webp', offset: 8, signature: Buffer.from([0x57, 0x45, 0x42, 0x50]) },
    { mime: 'application/pdf', offset: 0, signature: Buffer.from([0x25, 0x50, 0x44, 0x46]) },
    { mime: 'application/zip', offset: 0, signature: Buffer.from([0x50, 0x4b, 0x03, 0x04]) },
    { mime: 'video/mp4',  offset: 4, signature: Buffer.from([0x66, 0x74, 0x79, 0x70]) },
];

/**
 * Checks magic bytes of a buffer against known signatures.
 * Returns false only when a known signature exists for the declared MIME
 * and the file bytes do NOT match — allowing pass-through for types without
 * a registered signature (e.g. docx, csv, svg).
 */
function magicBytesMatch(buffer, mimeType) {
    const rules = MAGIC_SIGNATURES.filter(r => r.mime === mimeType);
    if (rules.length === 0) return true; // No rule — cannot verify, allow through

    return rules.some(({ offset, signature }) => {
        if (buffer.length < offset + signature.length) return false;
        return buffer.slice(offset, offset + signature.length).equals(signature);
    });
}

// Multer configuration
// Use memory storage — we pass the buffer directly to Supabase/Google Drive.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: config.media.maxFileSizeBytes,
        files: 1,
    },
    fileFilter(_req, file, cb) {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            const err = new Error(`File type '${file.mimetype}' is not allowed.`);
            err.statusCode = 400;
            return cb(err, false);
        }
        cb(null, true);
    },
});

/**
 * Multer single-file middleware for the 'file' field.
 * Wraps multer errors into standard project error shape.
 */
export const uploadMiddleware = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (!err) return next();

        if (err.code === 'LIMIT_FILE_SIZE') {
            const limitMB = Math.round(config.media.maxFileSizeBytes / 1024 / 1024);
            err.statusCode = 400;
            err.message = `File exceeds the maximum allowed size of ${limitMB} MB.`;
        } else if (!err.statusCode) {
            err.statusCode = 400;
        }
        next(err);
    });
};

/**
 * Post-multer middleware: validates that a file was actually provided and
 * that the magic bytes match the declared MIME type.
 */
export const validateFile = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            status: 'error',
            message: 'No file provided. Use multipart/form-data with field name "file".',
        });
    }

    if (!magicBytesMatch(req.file.buffer, req.file.mimetype)) {
        return res.status(400).json({
            status: 'error',
            message: 'File content does not match its declared MIME type.',
        });
    }

    next();
};
