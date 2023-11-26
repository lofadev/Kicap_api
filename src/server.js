import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import router from './routes/index.js';
import bodyParser from 'body-parser';

const PORT = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URL;
const app = express();

dotenv.config();
app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log('Connected');
    router(app);
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
