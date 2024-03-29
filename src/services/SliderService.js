import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';

import Slider from '../models/SliderModel.js';

const createSlider = (newSLider) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { image, url } = newSLider;
      const fileName = `images/${Date.now() + '_' + image.originalname}`;
      const storage = getStorage();
      const storageRef = ref(storage, fileName);
      const metadata = {
        contentType: image.mimetype,
      };
      const snapshot = await uploadBytesResumable(storageRef, image.buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const slider = await Slider.create({
        image: downloadURL,
        url: url,
        file_name: fileName.split('/')[1],
      });
      resolve({
        status: 'OK',
        message: 'Thêm mới Slider thành công.',
        data: slider,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getSlider = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const sliders = await Slider.find({});
      resolve({
        status: 'OK',
        message: 'Danh sách Slider.',
        data: sliders,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateSlider = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const slider = await Slider.findOne({ _id: id });
      if (!slider) {
        resolve({
          status: 'ERROR',
          message: 'Slider này không tồn tại.',
        });
      }
      const { image } = data;
      const fileName = `images/${Date.now() + '_' + image.originalname}`;
      const storage = getStorage();

      // remove image from firebase
      const desertRef = ref(storage, slider.file_name);
      await deleteObject(desertRef);

      // add new image to firebase
      const storageRef = ref(storage, fileName);
      const metadata = {
        contentType: image.mimetype,
      };
      const snapshot = await uploadBytesResumable(storageRef, image.buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      data.image = downloadURL;
      const newSlider = await Slider.findByIdAndUpdate(id, data, { new: true });
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
      const slider = await Slider.findByIdAndDelete({ _id: id });

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
  getSlider,
  updateSlider,
  deleteSlider,
};
export default SliderService;
