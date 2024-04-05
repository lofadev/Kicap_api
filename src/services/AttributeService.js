import Attribute from '../models/AttributeModel.js';

const createAttribute = (newAttribute) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, displayOrder } = newAttribute;
      const attribute = await Attribute.findOne({ name });
      if (attribute) {
        resolve({
          status: 'ERROR',
          message: 'Thuộc tính của sản phẩm này đã tồn tại.',
        });
      }
      const attributeCreated = await Attribute.create({ name, displayOrder });
      resolve({
        status: 'OK',
        message: 'Thêm thuộc tính sản phẩm thành công.',
        data: attributeCreated,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getAttributes = (page, limit, search) => {
  return new Promise(async (resolve, reject) => {
    try {
      const skip = (page - 1) * limit;
      let query = {};
      if (search) {
        query = { attributeName: { $regex: search, $options: 'i' } };
      }
      const totalAttibutes = await Attribute.countDocuments(query);
      const attributes = await Attribute.find(query).skip(skip).limit(limit);
      const totalPage = Math.ceil(totalAttibutes / limit);
      resolve({
        status: 'OK',
        message: 'Lấy danh sách thuộc tính sản phẩm.',
        data: attributes,
        currentPage: page,
        totalAttibutes,
        totalPage,
        limit,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getAttribute = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const attribute = await Attribute.findById(id);
      if (!attribute) {
        resolve({
          status: 'ERROR',
          message: 'Thuộc tính sản phẩm này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Lấy thuộc tính sản phẩm thành công.',
        data: attribute,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateAttribute = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newAttribute = await Attribute.findByIdAndUpdate(id, data, { new: true });
      if (!newAttribute) {
        resolve({
          status: 'ERROR',
          message: 'Thuộc tính sản phẩm này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Cập nhật thuộc tính sản phẩm thành công.',
        data: newAttribute,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteAttribute = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const attribute = await Attribute.findByIdAndDelete(id);
      if (!attribute) {
        resolve({
          status: 'ERROR',
          message: 'Thuộc tính sản phẩm này không tồn tại.',
        });
      }

      resolve({
        status: 'OK',
        message: 'Đã xóa thuộc tính sản phẩm thành công.',
        data: attribute,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const AttributeService = {
  createAttribute,
  getAttribute,
  getAttributes,
  updateAttribute,
  deleteAttribute,
};
export default AttributeService;
