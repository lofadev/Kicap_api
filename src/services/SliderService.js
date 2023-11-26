import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
  deleteObject,
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
        file_name: fileName,
      });
      resolve({
        status: 'OK',
        message: 'Thêm mới Slide thành công.',
        data: slider,
      });
    } catch (error) {
      reject(error);
    }
  });
};
const updateSlider = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkSlider = await Slider.findOne({ _id: id });
      if (!checkSlider) {
        return resolve({
          status: 'ERROR',
          message: 'Slider này không tồn tại.',
        });
      }
      const { image, url } = data;
      const fileName = `images/${Date.now() + '_' + image.originalname}`;
      const storage = getStorage();

      // remove image from firebase
      const desertRef = ref(storage, checkSlider.file_name);
      deleteObject(desertRef)
        .then(() => {
          console.log('Đã xóa ở firebase thành công.');
        })
        .catch((error) => {
          console.log(error);
        });

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
        message: 'Cập nhật Slide thành công.',
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
      const checkSlider = await Slider.findOne({ _id: id });
      if (!checkSlider) {
        return resolve({
          status: 'ERROR',
          message: 'Slider này không tồn tại.',
        });
      }
      const storage = getStorage();
      const desertRef = ref(storage, checkSlider.file_name);
      deleteObject(desertRef)
        .then(() => {
          console.log('Đã xóa ở firebase thành công.');
        })
        .catch((error) => {
          console.log(error);
        });
      await Slider.findByIdAndDelete(id);
      resolve({
        status: 'OK',
        message: 'Đã xóa Slide thành công.',
      });
    } catch (error) {
      reject(error);
    }
  });
};

const SliderService = {
  createSlider,
  updateSlider,
  deleteSlider,
};
export default SliderService;
