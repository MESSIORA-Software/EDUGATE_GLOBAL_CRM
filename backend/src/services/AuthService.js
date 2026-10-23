import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UsersRepository.js';

export const authService = {
    async login({ email, password }) {
        if (!email || !password) {
            const error = new Error('Email and password are required');
            error.statusCode = 400;
            throw error;
        }

        // 1. Find user by email
        const user = await UserRepository.finduserbyemail(email);
        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        // 2. Check if user is active
        if (user.status && user.status.toLowerCase() !== 'active') {
            const error = new Error('Your account is inactive. Please contact administrator.');
            error.statusCode = 403;
            throw error;
        }

        // 3. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        // 4. Create JWT Payload
        const payload = {
            user_id: user.user_id,
            email: user.email,
            role_id: user.role_id,
            branch_id: user.branch_id,
            name: user.name
        };

        // 5. Sign JWT Token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        // 6. Return user details (without password_hash) and token
        const { password_hash, ...safeUser } = user;

        return {
            token,
            user: safeUser
        };
    },

    async getMe(user_id) {
        const user = await UserRepository.finduserbyid(user_id);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        const { password_hash, ...safeUser } = user;
        return safeUser;
    },

       async logout(user_id) {
        // Optional: Update last_logout timestamp in DB or audit logs if needed
        // await UserRepository.updateLastLogout(userId);
        
        return {
            message: 'User logged out successfully'
        };
    },

    async resetPassword({ email, currentPassword, newPassword }) {
        if (!email || !newPassword) {
            const error = new Error('Email and new password are required');
            error.statusCode = 400;
            throw error;
        }

        const user = await UserRepository.finduserbyemail(email.trim());
        if (!user) {
            const error = new Error('No user found with the provided email address');
            error.statusCode = 404;
            throw error;
        }

        // If currentPassword is provided, verify it
        if (currentPassword) {
            let isPasswordValid = false;
            if (user.password_hash && user.password_hash.startsWith('$2')) {
                isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
            } else {
                isPasswordValid = currentPassword === user.password_hash;
            }
            if (!isPasswordValid) {
                const error = new Error('The temporary/current password you entered is incorrect');
                error.statusCode = 401;
                throw error;
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword.trim(), salt);

        await UserRepository.updateuser(user.user_id, {
            password_hash: hashedPassword,
            updated_at: new Date()
        });

        return {
            message: 'Password reset successfully. You can now log in with your new password.'
        };
    },

    async verifyPassword({ userId, email, password }) {
        if (!password) {
            const error = new Error('Password is required');
            error.statusCode = 400;
            throw error;
        }

        let user = null;
        if (userId) {
            user = await UserRepository.finduserbyid(userId);
        } else if (email) {
            user = await UserRepository.finduserbyemail(email.trim());
        }

        if (!user) {
            const error = new Error('Current user account not found');
            error.statusCode = 404;
            throw error;
        }

        let isPasswordValid = false;
        if (user.password_hash && user.password_hash.startsWith('$2')) {
            isPasswordValid = await bcrypt.compare(password, user.password_hash);
        } else {
            isPasswordValid = password === user.password_hash;
        }
        if (!isPasswordValid) {
            const error = new Error('Incorrect password. Please enter your valid current password.');
            error.statusCode = 401;
            throw error;
        }

        return { verified: true };
    }
};
