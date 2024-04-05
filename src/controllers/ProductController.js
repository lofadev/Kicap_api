import ProductService from '../services/ProductService.js';

const createProduct = async (req, res) => {
  try {
    const { name, brand, categoryID, supplierID } = req.body;
    if (!name || !brand || !categoryID || !supplierID) {
      return res.status(400).json(variable.NOT_EMPTY);
    }
    const response = await ProductService.createProduct(req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    return res.status(400).json({
      status: 'ERROR',
      message: error,
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await ProductService.getProduct(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    return res.status(400).json({
      status: 'ERROR',
      message: error,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const response = await ProductService.getProducts(
      Number(page || 1),
      Number(limit || 10),
      search
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({
      status: 'ERROR',
      message: error,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await ProductService.updateProduct(id, req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    return res.status(400).json({ status: 'ERROR', message: error });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await ProductService.deleteProduct(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    return res.status(400).json({
      status: 'ERROR',
      message: error,
    });
  }
};

const ProductController = { createProduct, getProduct, getProducts, updateProduct, deleteProduct };
export default ProductController;
