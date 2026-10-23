import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UsersRepository.js';
import { BranchRepository } from '../repositories/BranchRepository.js';
import { EmailService } from './EmailService.js';

export const userService = {
    // Get all users
    async getAllUsers() {
        return await UserRepository.findusers();
    },

    // Get users by role (e.g. 'STAFF', 'EDUGATE_STAFF', 'ADMIN', 'SUPER_ADMIN')
    async getUsersByRole(roleId) {
        if (!roleId) return await UserRepository.findusers();
        const target = String(roleId).toUpperCase().trim();
        const altTarget = target.startsWith('EDUGATE_') ? target.replace(/^EDUGATE_/, '') : `EDUGATE_${target}`;

        try {
            const users = await UserRepository.findUsersByRole(roleId);
            if (users && users.length > 0) return users;
        } catch {
            // fallback
        }
        const allUsers = await UserRepository.findusers();
        return (allUsers || []).filter(u => {
            const r = String(u.role_id || '').toUpperCase().trim();
            return r === target || r === altTarget || r.endsWith(`_${target}`) || (target === 'STAFF' && r.includes('STAFF'));
        });
    },
 
    // Get a user by ID
    async getUserById(user_id) {
           const user = await UserRepository.finduserbyid(user_id);
                if (!user) {
                    const error = new Error(`User with ID '${user_id}' not found`);
                    error.statusCode = 404;
                    throw error;
                }
                return user;
    },

    // Create a new user
    async createUser({
        branch_id,
        name,
        email,
        password,
        password_hash,
        role_id,
        status,
        created_by = null
    }) {
        let finalBranchId = branch_id;
        if (!finalBranchId) {
            try {
                const allBranches = await BranchRepository.getAllBranches();
                finalBranchId = allBranches?.[0]?.branch_id || allBranches?.[0]?.id || 1;
            } catch {
                finalBranchId = 1;
            }
        }

        const rawPassword = password || password_hash || '';

        // Automatically hash plain password if not already hashed
        let hashedPassword = password_hash;
        if (password_hash && !password_hash.startsWith('$2')) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password_hash, salt);
        }

        const userData = {
            branch_id: Number(finalBranchId) || 1,
            name: name,
            email: email,
            password_hash: hashedPassword,
            role_id: role_id,
            status: status,
            created_by: created_by || null,
            created_at: new Date()
        };

        const newUser = await UserRepository.createuser(userData);

        // Send welcome email with temporary password & reset password link automatically
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const resetPasswordUrl = `${frontendUrl}/reset-password?email=${encodeURIComponent(email)}`;
            await EmailService.sendWelcomeCredentialsEmail({
                to: email,
                name: name,
                tempPassword: rawPassword,
                roleName: role_id,
                resetPasswordUrl,
            });
            console.log(`[UsersService] Welcome credentials email sent automatically to ${email}`);
        } catch (emailErr) {
            console.error('[UsersService] Failed to send welcome credentials email:', emailErr.message);
        }

        return newUser;
    },
    


       // Update user
    async updateuser(user_id, { branch_id, name, email, password_hash, role_id, status }) {
        // 1. Check if user exists (throws 404 error if not found)
        const existingUser = await this.getUserById(user_id);

        const existingEmail = (existingUser?.email || '').trim().toLowerCase();
        const incomingEmail = email !== undefined ? email.trim().toLowerCase() : existingEmail;
        const isEmailChanged = incomingEmail !== existingEmail;

        const existingRole = String(existingUser?.role_id || '').trim();
        const incomingRole = role_id !== undefined ? String(role_id).trim() : existingRole;
        const isRoleChanged = incomingRole !== existingRole;

        const rawPassword = password_hash && !password_hash.startsWith('$2') ? password_hash : null;

        // 2. Build update data with only provided fields
        const updateData = {};
        if (branch_id !== undefined) updateData.branch_id = branch_id;
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;

        if (password_hash !== undefined) {
            if (!password_hash.startsWith('$2')) {
                const salt = await bcrypt.genSalt(10);
                updateData.password_hash = await bcrypt.hash(password_hash, salt);
            } else {
                updateData.password_hash = password_hash;
            }
        }

        if (role_id !== undefined) updateData.role_id = role_id;
        if (status !== undefined) updateData.status = status;
        updateData.updated_at = new Date();

        // 3. Call UserRepository to update
        const updatedUser = await UserRepository.updateuser(user_id, updateData);

        // 4. Send updated credentials email if email or role changed and temporary password was provided
        if ((isEmailChanged || isRoleChanged) && rawPassword) {
            try {
                const recipientEmail = (email || existingUser.email).trim();
                const recipientName = name || existingUser.name || 'User';
                const finalRoleName = role_id !== undefined ? role_id : existingUser.role_id;

                let reason = '';
                if (isEmailChanged && isRoleChanged) {
                    reason = `Your registered email address was changed to "${recipientEmail}" and your system role was updated.`;
                } else if (isEmailChanged) {
                    reason = `Your registered email address was changed to "${recipientEmail}".`;
                } else {
                    reason = `Your system access role was changed to "${finalRoleName}".`;
                }

                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                const resetPasswordUrl = `${frontendUrl}/reset-password?email=${encodeURIComponent(recipientEmail)}`;

                await EmailService.sendAccountUpdatedCredentialsEmail({
                    to: recipientEmail,
                    name: recipientName,
                    tempPassword: rawPassword,
                    roleName: finalRoleName,
                    reason,
                    resetPasswordUrl,
                });
                console.log(`[UsersService] Account updated credentials email sent successfully to ${recipientEmail}`);
            } catch (emailErr) {
                console.error('[UsersService] Failed to send account updated credentials email:', emailErr.message);
            }
        }

        return updatedUser;
    },

    async deleteUser(user_id) {
        // 1. Check if user exists (throws 404 error if not found)
        await this.getUserById(user_id);

        // 2. Call UserRepository to delete
        return await UserRepository.deleteUser(user_id);
    }, 

    async findUsersByBranch(branch_id) {
        return await UserRepository.findUsersByBranch(branch_id);
    }
  
};
    