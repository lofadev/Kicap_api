import VariantService from '../services/VariantService.js';
import variable from '../variable.js';

const createVariant = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || !price) {
      return res.status(400).json(variable.NOT_EMPTY);
    }
    const response = await VariantService.createVariant(req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getVariants = async (req, res) => {
  try {
    const id = req.query.id;
    const response = await VariantService.getVariants(id);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getVariant = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await VariantService.getVariant(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const updateVariant = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await VariantService.updateVariant(id, req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const deleteVariant = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await VariantService.deleteVariant(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const VariantController = {
  createVariant,
  getVariants,
  getVariant,
  updateVariant,
  deleteVariant,
};
export default VariantController;
