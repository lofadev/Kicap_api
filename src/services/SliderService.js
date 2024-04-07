import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import Slider from '../models/SliderModel.js';
import { getApp } from 'firebase/app';
import { deleteImageFromFirebase, uploadImageToFirebase } from '../utils/index.js';

const createSlider = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const imageURL = await uploadImageToFirebase(payload.image);
      const slider = await Slider.create({
        ...payload,
        image: imageURL,
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

const getSlider = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const slider = await Slider.findById(id);
      if (!slider) {
        resolve({
          status: 'ERROR',
          message: 'Slider này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Xem chi tiết slider.',
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
        query = { description: { $regex: search, $options: 'i' } };
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

const updateSlider = (id, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const slider = await Slider.findById(id);
      if (!slider) {
        resolve({
          status: 'ERROR',
          message: 'Slider này không tồn tại.',
        });
      }
      if (payload.image) {
        const [imageURL, deleteOldImage] = await Promise.all([
          uploadImageToFirebase(payload.image),
          deleteImageFromFirebase(slider.image),
        ]);
        if (imageURL) payload.image = imageURL;
      }
      const newSlider = await Slider.findByIdAndUpdate(id, payload, { new: true });
      if (newSlider) {
        resolve({
          status: 'OK',
          message: 'Cập nhật slider thành công.',
          data: newSlider,
        });
      }
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
      if (slider.image) {
        await deleteImageFromFirebase(slider.image);
      }
      resolve({
        status: 'OK',
        message: 'Đã xóa slider thành công.',
      });
    } catch (error) {
      reject(error);
    }
  });
};

const SliderService = {
  createSlider,
  getSliders,
  getSlider,
  updateSlider,
  deleteSlider,
};
export default SliderService;
