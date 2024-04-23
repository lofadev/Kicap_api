import ProductService from '../services/ProductService.js';
import variable from '../variable.js';

const createProduct = async (req, res) => {
  try {
    const { name, brand, category, supplier } = req.body;
    if (!name || !brand || !category || !supplier) {
      return res.status(400).json(variable.NOT_EMPTY);
    }
    const image = req.file;
    const payload = { ...req.body, image };
    const response = await ProductService.createProduct(payload);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await ProductService.getProduct(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getProducts = async (req, res) => {
  try {
    const { page, limit, search, type, sort } = req.query;
    const response = await ProductService.getProducts(
      Number(page || 1),
      Number(limit || 10),
      search,
      type
    );
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const image = req.file;
    const payload = { ...req.body, image };
    const response = await ProductService.updateProduct(id, payload);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await ProductService.deleteProduct(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const ProductController = { createProduct, getProduct, getProducts, updateProduct, deleteProduct };
export default ProductController;
