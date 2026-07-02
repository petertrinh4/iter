import express from 'express';
import cors from 'cors';

import registerAPI from './APIs/User/registerAPI.js';
import loginAPI from './APIs/User/loginAPI.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => {
  res.send('🏃‍♂️ Running App API is up and running!');
});

app.use('/APIs/User', registerAPI);
app.use('/APIs/User', loginAPI);

export default app;