import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UsersRepository.js';



export const userService = {
    // Get all users
    async getAllUsers() {
        return await UserRepository.findusers();
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
    password_hash,
    role_id,
    status,
    created_by = null
}) {

    // Automatically hash plain password if not already hashed
        let hashedPassword = password_hash;
        if (password_hash && !password_hash.startsWith('$2')) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password_hash, salt);
        }


    const userData = {
        branch_id: branch_id,
        name: name,
        email: email,
        password_hash: hashedPassword,
        role_id: role_id,
        status: status,
        created_by: created_by || null,
        created_at: new Date()
    };

    return await UserRepository.createuser(userData);
},
    


       // Update user
    async updateuser(user_id, { branch_id, name, email, password_hash, role_id, status }) {
        // 1. Check if user exists (throws 404 error if not found)
        await this.getUserById(user_id);

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
        return await UserRepository.updateuser(user_id, updateData);
    },

    async deleteUser(user_id) {
        // 1. Check if user exists (throws 404 error if not found)
        await this.getUserById(user_id);

        // 2. Call UserRepository to delete
        return await UserRepository.deleteUser(user_id);
    }, 
  
};
    