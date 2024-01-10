import SliderService from '../services/SliderService.js';

const createSlider = async (req, res) => {
  try {
    const image = req.file;
    const { url } = req.body;
    if (!image) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Image là bắt buộc.',
      });
    } else if (image && image.mimetype.includes('jpeg') && image.mimetype.includes('png')) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Đây không phải là kiểu hình ảnh.',
      });
    } else if (image.size > 1024 * 1024 * 5) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'File ảnh không được lớn hơn 5MB.',
      });
    }
    const data = { image, url };
    const response = await SliderService.createSlider(data);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
};

const getSlider = async (req, res) => {
  try {
    const response = await SliderService.getSlider();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
};

const updateSlider = async (req, res) => {
  try {
    const image = req.file;
    const { url } = req.body;
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'ID param là bắt buộc.',
      });
    } else if (!image) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Image là bắt buộc.',
      });
    } else if (image && image.mimetype.includes('jpeg') && image.mimetype.includes('png')) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Đây không phải là kiểu hình ảnh.',
      });
    } else if (image.size > 1024 * 1024 * 5) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'File ảnh không được lớn hơn 5MB.',
      });
    }
    const data = { image, url };
    const response = await SliderService.updateSlider(id, data);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
};

const deleteSlider = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'ID param là bắt buộc.',
      });
    }
    const response = await SliderService.deleteSlider(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
};

const SliderController = {
  createSlider,
  getSlider,
  updateSlider,
  deleteSlider,
};
export default SliderController;
