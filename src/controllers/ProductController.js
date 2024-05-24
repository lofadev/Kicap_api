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
    const { page, limit, search, category, sortBy, brand, price, stock } = req.query;
    let newPrice = [];
    if (price) {
      if (typeof price === 'string') {
        newPrice.push(price);
      } else {
        newPrice = price;
      }
      newPrice = newPrice.map((price) => {
        if (price === '(<100000)') {
          return [1, 100000];
        } else if (price === '(>1000000)') {
          return [1000000];
        }
        const priceStrings = price.split(',');
        const priceNumbers = priceStrings.map((p) => Number(p));
        return priceNumbers;
      });
    }

    const defaultSortby = sortBy ? sortBy : 'created_on:desc';
    const payload = {
      page: Number(page || 1),
      limit: Number(limit || 10),
      search: search ?? '',
      category: category ? [category] : [],
      sortBy: defaultSortby,
      brand: brand ? [brand] : [],
      price: price ? newPrice : [],
      stock,
    };
    const response = await ProductService.getProducts(payload);
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

const checkQuantityProduct = async (req, res) => {
  try {
    const { ids } = req.body;
    const response = await ProductService.checkQuantityProduct(ids);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getBrands = async (req, res) => {
  try {
    const response = await ProductService.getBrands();
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getMenu = async (req, res) => {
  try {
    const response = await ProductService.getMenu();
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const ProductController = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  checkQuantityProduct,
  getBrands,
  getMenu,
};
export default ProductController;
