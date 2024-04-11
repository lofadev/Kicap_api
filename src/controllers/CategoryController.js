import CategoryService from '../services/CategoryService.js';
import variable from '../variable.js';

const createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    if (!categoryName) {
      return res.status(400).json(variable.NOT_EMPTY);
    }
    const response = await CategoryService.createCategory(req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getCategorys = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const response = await CategoryService.getCategorys(
      Number(page || 1),
      Number(limit || 10),
      search
    );
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await CategoryService.getCategory(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await CategoryService.updateCategory(id, req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await CategoryService.deleteCategory(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const CategoryController = {
  createCategory,
  getCategorys,
  getCategory,
  updateCategory,
  deleteCategory,
};
export default CategoryController;
