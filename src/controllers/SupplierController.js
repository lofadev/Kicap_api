import SupplierService from '../services/SupplierService.js';
import variable from '../variable.js';

const createSupplier = async (req, res) => {
  try {
    const { name, contactName, province, address, phone, email } = req.body;
    if (!name || !contactName || !province || !address || !phone || !email) {
      return res.status(400).json(variable.NOT_EMPTY);
    }
    const response = await SupplierService.createSupplier(req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getSuppliers = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const response = await SupplierService.getSuppliers(
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

const getSupplier = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status.json(variable.NOT_EMPTY);
    }
    const response = await SupplierService.getSupplier(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await SupplierService.updateSupplier(id, req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    return res.status(400).json({ status: 'ERROR', message: error });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await SupplierService.deleteSupplier(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const SupplierController = {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
};
export default SupplierController;
