//Insert whatever is needed for the backend index.ts file here
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import registerAPI from './APIs/User/registerAPI.js'; // Import the register API router

// 1. Load environment variables from your .env file
dotenv.config();

// 2. Initialize the Express application
const app = express();

// 3. Configure Middleware
// CORS allows your frontend (Vite/React) to communicate with this backend API
app.use(cors());
// express.json() allows your API to read JSON data sent in the request body (like passwords and emails)
app.use(express.json());

app.use('/APIs/User', registerAPI); // Use the register API for user registration

// 4. Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI is missing in .env file");
    }
    
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB:`, error);
    process.exit(1); // Stop the server if the database connection fails
  }
};

// Execute the connection function
connectDB();

// 5. Setup Routes
// A simple test route so you can verify the server is running in your browser
app.get('/', (req, res) => {
  res.send('🏃‍♂️ Running App API is up and running!');
});

/* Uncomment these lines once you are ready to link your loginAPI.tsx file!
  Note: In modern Node.js ES Modules, you often have to append '.js' to local imports
  even if the actual file is '.ts' or '.tsx'.
*/
// import userRoutes from './loginAPI.js';
// app.use('/', userRoutes);


// 6. Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});