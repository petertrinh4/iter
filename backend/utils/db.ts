import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return;
  }

  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error('MONGO_URI is missing');
  }

  await mongoose.connect(mongoURI);

  isConnected = true;
  console.log('✅ MongoDB Connected');
}