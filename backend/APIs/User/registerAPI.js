//Insert Registeration API here
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const router = express.Router();
// 2. Mongoose Schema
// This tells MongoDB how to structure the data in the database
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
// Create the Mongoose Model (or use the existing one if it's already compiled)
const User = mongoose.models.User || mongoose.model('User', userSchema);
// ==========================================
// Insert User Registration API here
// ==========================================
router.post('/registerAPI', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        // 1. Basic validation
        if (!name || !username || !email || !password) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }
        // 2. Check if user already exists in MongoDB
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: "An account with this email or username already exists." });
        }
        // 3. Hash the password for security (Salt rounds = 10)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // 4. Save the new user to the database
        const newUser = new User({
            name,
            username,
            email,
            passwordHash: hashedPassword // Notice we DO NOT save the raw password!
        });
        const savedUser = await newUser.save();
        // 5. Send back a success response (omitting the password hash)
        res.status(201).json({
            message: "User registered successfully!",
            user: {
                id: savedUser._id,
                name: savedUser.name,
                username: savedUser.username,
                email: savedUser.email
            }
        });
    }
    catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Server error during registration." });
    }
});
export default router;
//# sourceMappingURL=registerAPI.js.map