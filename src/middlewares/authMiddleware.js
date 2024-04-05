import jwt from 'jsonwebtoken';
import variable from '../variable.js';
import { getToken } from '../utils/index.js';

const authMiddleWare = (req, res, next) => {
  const token = getToken(req);
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json(variable.TOKEN_EXPIRED);
      }
      return res.status(400).json(variable.HAS_ERROR);
    }
    if (user?.isAdmin) {
      next();
    } else {
      return res.status(403).json(variable.NOT_PERMISSION);
    }
  });
};

const authUserMiddleWare = (req, res, next) => {
  const token = getToken(req);
  const userId = req.params.id;
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return res.status(403).json(variable.NOT_PERMISSION);
    }
    if (user?.isAdmin || user?.id === userId) {
      res.isAdmin = user.isAdmin;
      next();
    } else {
      return res.status(403).json(variable.NOT_PERMISSION);
    }
  });
};

export { authMiddleWare, authUserMiddleWare };
