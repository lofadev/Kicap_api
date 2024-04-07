import ProductImageService from '../services/ProductImageService.js';
import variable from '../variable.js';

const createProductImage = async (req, res) => {
  try {
    const image = req.file;
    const payload = { ...req.body, image };
    const response = await ProductImageService.createProductImage(payload);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getProductImage = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await ProductImageService.getProductImage(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getProductImages = async (req, res) => {
  try {
    const id = req.query.id;
    const response = await ProductImageService.getProductImages(id);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const updateProductImage = async (req, res) => {
  try {
    const id = req.params.id;
    const image = req.file;
    const payload = { ...req.body, image };
    const response = await ProductImageService.updateProductImage(id, payload);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await ProductImageService.deleteProductImage(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getMaxOrder = async (req, res) => {
  try {
    const id = req.query.id;
    const response = await ProductImageService.getMaxOrder(id);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const ProductController = {
  createProductImage,
  getProductImage,
  getProductImages,
  updateProductImage,
  deleteProductImage,
  getMaxOrder,
};
export default ProductController;
