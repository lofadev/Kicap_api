import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import router from './src/routes/index.js';

dotenv.config();
const port = process.env.PORT || 3000;
const mongodbUrl = process.env.MONGODB_URL;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

try {
  await mongoose.connect(mongodbUrl);
  router(app);
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
} catch (error) {
  console.log(error);
}
