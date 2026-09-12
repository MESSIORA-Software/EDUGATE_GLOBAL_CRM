export const BranchValidator = {
    validateCreateBranch(req, res, next) {
        const { name, address, phone } = req.body || {};

        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Field "name" is required and must be a non-empty string.',
            });
        }

        if (!address || typeof address !== 'string' || !address.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Field "address" is required and must be a non-empty string.',
            });
        }

        if (!phone || typeof phone !== 'string' || !phone.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Field "phone" is required and must be a non-empty string.',
            });
        }

        next();
    },

    validateUpdateBranch(req, res, next) {
        const { branch_id, name, address, phone } = req.body || {};

        if (branch_id === undefined || branch_id === null || branch_id === '') {
            return res.status(400).json({
                status: 'error',
                message: 'Field "branch_id" is required in request body.',
            });
        }

        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Field "name" is required and must be a non-empty string.',
            });
        }

        if (!address || typeof address !== 'string' || !address.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Field "address" is required and must be a non-empty string.',
            });
        }

        if (!phone || typeof phone !== 'string' || !phone.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Field "phone" is required and must be a non-empty string.',
            });
        }

        next();
    }
};
