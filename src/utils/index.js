import jwt from 'jsonwebtoken';
import variable from '../variable.js';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { getApp } from 'firebase/app';
import unidecode from 'unidecode';

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
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: '2d' });
  return accessToken;
};

const generateRefreshToken = (payload) => {
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: '7d' });
  return refreshToken;
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
          resolve(variable.HAS_ERROR);
        }
        const accessToken = generateAccessToken({
          id: user?._id,
          isAdmin: user?.isAdmin,
        });
        resolve({
          status: 'OK',
          message: 'Lấy lại accessToken thành công',
          accessToken,
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getToken = (req) => req.headers.authorization?.split(' ')[1];

const generateSKU = () => {
  const time = Date.now();
  const timeString = time.toString();
  return 'SKU' + timeString.slice(timeString.length - 5, timeString.length);
};

async function uploadImageToFirebase(image) {
  try {
    const fileName = `images/${Date.now()}`;
    const firebaseApp = getApp();
    const storage = getStorage(firebaseApp, process.env.FIREBASE_STORAGEBUCKET);
    const storageRef = ref(storage, fileName);
    const metadata = {
      contentType: image.mimetype,
    };
    const snapshot = await uploadBytesResumable(storageRef, image.buffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase:', error);
    throw error;
  }
}

async function uploadMultipleImagesToFirebase(images) {
  try {
    const uploadPromises = images.map((image) => uploadImageToFirebase(image));
    const uploadResults = await Promise.all(uploadPromises);
    return uploadResults;
  } catch (error) {
    console.error('Error uploading images to Firebase:', error);
    throw error;
  }
}

async function deleteImageFromFirebase(url) {
  try {
    const firebaseApp = getApp();
    const storage = getStorage(firebaseApp, process.env.FIREBASE_STORAGEBUCKET);

    // remove image from firebase
    const desertRef = ref(storage, url);
    await deleteObject(desertRef);
  } catch (error) {
    console.error('Error uploading image to Firebase:', error);
    throw error;
  }
}

const convertToSlug = (value = '') => {
  const valueLower = value.trim().toLowerCase();
  const unidecodeValue = unidecode(valueLower);
  const valueWithoutSpecialChar = unidecodeValue.replace(/[^a-z0-9]+/g, '-');
  const result = valueWithoutSpecialChar.replace(/^-+|-+$/g, '');
  return result;
};

const roundedPrice = (price) => Math.round(price / 1000) * 1000;

export {
  isEmail,
  isVietNamPhoneNumber,
  generateAccessToken,
  generateRefreshToken,
  isTokenExpired,
  refreshTokenService,
  getToken,
  generateSKU,
  uploadImageToFirebase,
  deleteImageFromFirebase,
  uploadMultipleImagesToFirebase,
  convertToSlug,
  roundedPrice,
};
