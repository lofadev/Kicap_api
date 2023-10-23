import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import router from './router/index.js';

const app = express();

app.use(cors());

dotenv.config();
const PORT = process.env.PORT;

mongoose
  .connect(
    'mongodb+srv://lofa:200288Lofa@cluster0.lbrd8xz.mongodb.net/?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log('Đã kết nối đến database thành công');
    router(app);
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
