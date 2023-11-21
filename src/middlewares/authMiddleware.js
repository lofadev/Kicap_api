import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const authMiddleWare = (req, res, next) => {
  const token = req.headers.token;
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Not permission',
      });
    }
    if (user?.isAdmin) {
      next();
    } else {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Not permission',
      });
    }
  });
};

const authUserMiddleWare = (req, res, next) => {
  const token = req.headers.token;
  const userId = req.params.id;
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Not permission',
      });
    }
    if (user?.isAdmin || user?.id === userId) {
      res.isAdmin = user.isAdmin;
      next();
    } else {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Not permission',
      });
    }
  });
};

export { authMiddleWare, authUserMiddleWare };
