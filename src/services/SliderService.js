import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import Slider from '../models/SliderModel.js';
import { getApp } from 'firebase/app';

const createSlider = (image) => {
  return new Promise(async (resolve, reject) => {
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
      const slider = await Slider.create({
        image: downloadURL,
        fileName: fileName.split('/')[1],
      });
      resolve({
        status: 'OK',
        message: 'Thêm mới slider thành công.',
        data: slider,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getSliders = (page, limit, search) => {
  return new Promise(async (resolve, reject) => {
    try {
      const skip = (page - 1) * limit;
      let query = {};
      if (search) {
        query = { name: { $regex: search, $options: 'i' } };
      }
      const totalSliders = await Slider.countDocuments(query);
      const sliders = await Slider.find(query).skip(skip).limit(limit);
      const totalPage = Math.ceil(totalSliders / limit);
      resolve({
        status: 'OK',
        message: 'Lấy danh sách sliders.',
        data: sliders,
        currentPage: page,
        totalSliders,
        totalPage,
        limit,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateSlider = (id, image) => {
  return new Promise(async (resolve, reject) => {
    try {
      const slider = await Slider.findById(id);
      if (!slider) {
        resolve({
          status: 'ERROR',
          message: 'Slider này không tồn tại.',
        });
      }
      const fileName = `images/${Date.now()}`;
      const firebaseApp = getApp();
      const storage = getStorage(firebaseApp, process.env.FIREBASE_STORAGEBUCKET);

      // remove image from firebase
      const desertRef = ref(storage, slider.fileName);
      await deleteObject(desertRef);

      // add new image to firebase
      const storageRef = ref(storage, fileName);
      const metadata = {
        contentType: image.mimetype,
      };
      const snapshot = await uploadBytesResumable(storageRef, image.buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const newSlider = await Slider.findByIdAndUpdate(id, { image: downloadURL }, { new: true });
      resolve({
        status: 'OK',
        message: 'Cập nhật Slider thành công.',
        data: newSlider,
      });
    } catch (error) {
      reject(error);
    }
  });
};
const deleteSlider = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const slider = await Slider.findByIdAndDelete(id);

      if (!slider) {
        resolve({
          status: 'ERROR',
          message: 'Slider này không tồn tại.',
        });
      }

      const storage = getStorage();
      const desertRef = ref(storage, `images/${slider.file_name}`);
      await deleteObject(desertRef);

      resolve({
        status: 'OK',
        message: 'Đã xóa Slider thành công.',
      });
    } catch (error) {
      reject(error);
    }
  });
};

const SliderService = {
  createSlider,
  getSliders,
  updateSlider,
  deleteSlider,
};
export default SliderService;
