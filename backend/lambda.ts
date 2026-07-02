import serverless from 'serverless-http';
import app from './app.js';
import { connectDB } from './utils/db.js';

const expressHandler = serverless(app);

export const handler = async (
  event: any,
  context: any
) => {
  await connectDB();

  return expressHandler(event, context);
};