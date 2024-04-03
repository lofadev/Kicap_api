import SliderService from '../services/SliderService.js';

const createSlider = async (req, res) => {
  try {
    const image = req.file;
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
    const response = await SliderService.createSlider(image);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
};

const getSliders = async (req, res) => {
  try {
    const response = await SliderService.getSliders();
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
    const id = req.params.id;
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
    const response = await SliderService.updateSlider(id, image);
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
  getSliders,
  updateSlider,
  deleteSlider,
};
export default SliderController;
