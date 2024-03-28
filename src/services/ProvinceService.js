import Province from '../models/ProvinceModel.js';

const createProvince = (newProvince) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { provinceId, provinceName, provinceType } = newProvince;
      const province = await Province.findOne({ provinceId });
      if (province) {
        resolve({
          status: 'ERROR',
          message: 'Province ID này đã tồn tại.',
        });
      }
      const provinceCreated = await Province.create({ provinceId, provinceName, provinceType });
      resolve({
        status: 'OK',
        message: 'Thêm mới province thành công.',
        data: provinceCreated,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getProvinces = (search) => {
  return new Promise(async (resolve, reject) => {
    try {
      const provinces = await Province.find({
        provinceName: { $regex: search, $options: 'i' },
      });
      resolve({
        status: 'OK',
        message: 'Lấy danh sách provinces.',
        data: provinces,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getProvince = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const province = await Province.findById(id);
      if (!province) {
        resolve({
          status: 'ERROR',
          message: 'Province ID không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Lấy province thành công.',
        data: province,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const ProvinceService = {
  createProvince,
  getProvinces,
  getProvince,
};
export default ProvinceService;
