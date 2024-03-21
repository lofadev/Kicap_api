import jwt from 'jsonwebtoken';
import variable from '../variable.js';

const isEmail = (email) => {
  const regex =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return regex.test(email);
};

const isVietNamPhoneNumber = (phone) => {
  const vietnamesePhoneNumberRegex = /^(0[2-9]|1[2-9])[0-9]{8}$/;
  return vietnamesePhoneNumberRegex.test(phone);
};

const generateAccessToken = (payload) => {
  const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: '30s' });
  return access_token;
};

const generateRefreshToken = (payload) => {
  const refresh_token = jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: '7d' });
  return refresh_token;
};

const isTokenExpired = (token) => {
  const decodedToken = jwt.decode(token);
  const currentTime = Date.now() / 1000;
  return decodedToken.exp < currentTime;
};

const refreshTokenService = (token) => {
  return new Promise((resolve, reject) => {
    try {
      jwt.verify(token, process.env.REFRESH_TOKEN, (err, user) => {
        if (err) {
          return resolve(variable.NOT_PERMISSION);
        }
        const access_token = generateAccessToken({
          id: user?._id,
          isAdmin: user?.isAdmin,
        });
        resolve({
          status: 'OK',
          message: 'SUCCESS',
          access_token,
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getToken = (req) => req.headers.authorization.split(' ')[1];

export {
  isEmail,
  isVietNamPhoneNumber,
  generateAccessToken,
  generateRefreshToken,
  isTokenExpired,
  refreshTokenService,
  getToken,
};
