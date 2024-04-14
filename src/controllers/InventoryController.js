import InventoryService from '../services/InventoryService.js';
import variable from '../variable.js';

const getItemsInInventory = async (req, res) => {
  try {
    const response = await InventoryService.getItemsInInventory();
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getItemInInventory = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await InventoryService.getItemInInventory(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const updateItemInInventory = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await InventoryService.updateItemInInventory(id, req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const deleteItemInInventory = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await InventoryService.deleteItemInInventory(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const InventoryController = {
  getItemInInventory,
  getItemsInInventory,
  updateItemInInventory,
  deleteItemInInventory,
};
export default InventoryController;
