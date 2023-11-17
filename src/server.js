const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const router = require('./router');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
const PORT = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URL;

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
