export const UserRoleValidator = {
    validateCreateRole(req, res, next) {
        const { role_name } = req.body;


        if (!role_name || typeof role_name !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'Field "role_name" is required and must be string.',
            });
        }

        next();
    },

    validateUpdateRole(req, res, next) {
        const { role_name } = req.body;

        if (!role_name || typeof role_name !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'Field "role_name" is required and must be a string.',
            });
        }

        next();
    }
};
