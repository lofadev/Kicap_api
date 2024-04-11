import ProvinceService from '../services/ProvinceService.js';
import variable from '../variable.js';

const createProvince = async (req, res) => {
  try {
    const { provinceId, provinceName, provinceType } = req.body;
    if (!provinceId || !provinceName || !provinceType) {
      return res.status(400).json(variable.NOT_EMPTY);
    }
    const response = await ProvinceService.createProvince(req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getProvinces = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const response = await ProvinceService.getProvinces(search);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getProvince = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status.json(variable.REQUIRE_ID);
    }
    const response = await ProvinceService.getProvince(id);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const ShipperController = {
  createProvince,
  getProvinces,
  getProvince,
};
export default ShipperController;
