//Insert User Registration API here
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const router = express.Router();
// 2. Mongoose Schema
// This tells MongoDB how to structure the data in the database
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    //email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
// Create the Mongoose Model (or use the existing one if it's already compiled)
const User = mongoose.models.User || mongoose.model('User', userSchema);
// 3. Login API Endpoint
router.post('/loginAPI', async (req, res) => {
    try {
        const { username, password } = req.body;
        // 1. Basic validation
        if (!username || !password) {
            return res.status(400).json({ error: "Please provide username and password." });
        }
        // 2. Find the user by their username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password." });
        }
        // 3. Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid username or password." });
        }
        // 4. Generate a JSON Web Token (JWT)
        // IMPORTANT: In production, process.env.JWT_SECRET should be a long, random string in your .env file
        const jwtSecret = process.env.JWT_SECRET || "super_secret_development_key_do_not_use_in_prod";
        const token = jwt.sign({ userId: user._id }, // Payload (data attached to the token)
        jwtSecret, // Secret key to sign it
        { expiresIn: '7d' } // Token expires in 7 days
        );
        // 5. Send the token and user data back to the frontend
        res.status(200).json({
            message: "Login successful!",
            token: token,
            user: {
                id: user._id,
                username: user.username
                //name: user.name,
                //email: user.email
            }
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error during login." });
    }
});
export default router;
//# sourceMappingURL=loginAPI.js.map