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
    }
};
