import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const isEmail = (email) => {
  const regex =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return regex.test(email);
};

const isVietNamPhoneNumber = (phone) => {
  const vietnamesePhoneNumberRegex = /^(0[2-9]|1[2-9])[0-9]{8}$/;
  return vietnamesePhoneNumberRegex.test(phone);
};

const generalAccessToken = (payload) => {
  const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
  return access_token;
};

const generalRefreshToken = (payload) => {
  const refresh_token = jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: '365d' });
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
          return resolve({
            status: 'ERROR',
            message: 'Not permission',
          });
        }
        const access_token = generalAccessToken({
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

export {
  isEmail,
  isVietNamPhoneNumber,
  generalAccessToken,
  generalRefreshToken,
  isTokenExpired,
  refreshTokenService,
};
