import SliderService from '../services/SliderService.js';
import variable from '../variable.js';

const createSlider = async (req, res) => {
  try {
    const image = req.file;
    const payload = req.body;
    payload.image = image;
    const response = await SliderService.createSlider(payload);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getSlider = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await SliderService.getSlider(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getSliders = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const response = await SliderService.getSliders(Number(page || 1), Number(limit || 10), search);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const updateSlider = async (req, res) => {
  try {
    const id = req.params.id;
    const image = req.file;
    const payload = req.body;
    payload.image = image;
    const response = await SliderService.updateSlider(id, payload);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const deleteSlider = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await SliderService.deleteSlider(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const SliderController = {
  createSlider,
  getSliders,
  getSlider,
  updateSlider,
  deleteSlider,
};
export default SliderController;
