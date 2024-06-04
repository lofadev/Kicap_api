import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import router from './routes/index.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

dotenv.config();
const port = process.env.PORT;
const mongodbUrl = process.env.MONGODB_URL;
const app = express();

const delay = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

const midlewareDelay = async (req, res, next) => {
  await delay(500);
  next();
};

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(midlewareDelay);

try {
  await mongoose.connect(mongodbUrl);
  router(app);
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
} catch (error) {
  console.log(error);
}
