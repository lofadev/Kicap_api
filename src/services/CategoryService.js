import Category from '../models/CategoryModel.js';

const createCategory = (newCategory) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { categoryName, description } = newCategory;
      const category = await Category.findOne({ categoryName });
      if (category) {
        resolve({
          status: 'ERROR',
          message: 'Tên danh mục sản phẩm này đã tồn tại.',
        });
      }
      const categoryCreated = await Category.create({ categoryName, description });
      resolve({
        status: 'OK',
        message: 'Thêm mới danh mục sản phẩm thành công.',
        data: categoryCreated,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getCategorys = (page, limit, search) => {
  return new Promise(async (resolve, reject) => {
    try {
      const skip = (page - 1) * limit;
      let query = {};
      if (search) {
        query = { categoryName: { $regex: search, $options: 'i' } };
      }
      const totalCategories = await Category.countDocuments(query);
      const categories = await Category.find(query).skip(skip).limit(limit);
      const totalPage = Math.ceil(totalCategories / limit);
      resolve({
        status: 'OK',
        message: 'Lấy danh sách danh mục sản phẩm.',
        data: categories,
        currentPage: page,
        totalCategories,
        totalPage,
        limit,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getCategory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const catetory = await Category.findById(id);
      if (!catetory) {
        resolve({
          status: 'ERROR',
          message: 'Danh mục sản phẩm này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Lấy danh mục sản phẩm thành công.',
        data: catetory,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateCategory = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const category = await Category.findById(id);
      if (!category) {
        resolve({
          status: 'ERROR',
          message: 'Danh mục sản phẩm này không tồn tại.',
        });
      }
      const newCategory = await Category.findByIdAndUpdate(id, data, { new: true });
      resolve({
        status: 'OK',
        message: 'Cập nhật danh mục sản phẩm thành công.',
        data: newCategory,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteCategory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const category = await Category.findByIdAndDelete(id);
      if (!category) {
        resolve({
          status: 'ERROR',
          message: 'Danh mục sản phẩm này không tồn tại.',
        });
      }

      resolve({
        status: 'OK',
        message: 'Đã xóa danh mục sản phẩm thành công.',
        data: category,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const CategoryService = {
  createCategory,
  getCategory,
  getCategorys,
  updateCategory,
  deleteCategory,
};
export default CategoryService;
