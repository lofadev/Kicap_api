import AttributeService from '../services/AttributeService.js';

import variable from '../variable.js';

const createAttribute = async (req, res) => {
  try {
    const { name, displayOrder } = req.body;
    if (!name || !displayOrder) {
      return res.status(400).json(variable.NOT_EMPTY);
    }
    const response = await AttributeService.createAttribute(req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    return res.status(400).json({
      status: 'ERROR',
      message: error,
    });
  }
};

const getAttributes = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const response = await AttributeService.getAttributes(
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

const getAttribute = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await AttributeService.getAttribute(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    return res.status(400).json({
      status: 'ERROR',
      message: error,
    });
  }
};

const updateAttribute = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await AttributeService.updateAttribute(id, req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    return res.status(400).json({
      status: 'ERROR',
      message: error,
    });
  }
};

const deleteAttribute = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await AttributeService.deleteAttribute(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    return res.status(400).json({
      status: 'ERROR',
      message: error,
    });
  }
};

const AttributeController = {
  createAttribute,
  getAttributes,
  getAttribute,
  updateAttribute,
  deleteAttribute,
};
export default AttributeController;
