import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './utils/db.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();