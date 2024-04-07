import mongoose from 'mongoose';
import variable from '../variable.js';

const validateIdParam = (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(variable.ID_NOTVALID);
  }

  next();
};

const validateImage = (req, res, next) => {
  const image = req.file;
  if (!image) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Ảnh là bắt buộc.',
    });
  }
  if (image && image.mimetype.includes('jpeg') && image.mimetype.includes('png')) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Đây không phải là kiểu hình ảnh.',
    });
  }
  if (image.size > 1024 * 1024 * 2) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'File ảnh không được lớn hơn 2MB.',
    });
  }
  next();
};

const validateImageUpdate = (req, res, next) => {
  const image = req.file;
  if (image) {
    if (image.mimetype.includes('jpeg') && image.mimetype.includes('png')) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Đây không phải là kiểu hình ảnh.',
      });
    }
    if (image.size > 1024 * 1024 * 2) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'File ảnh không được lớn hơn 2MB.',
      });
    }
  }
  next();
};

export { validateIdParam, validateImage, validateImageUpdate };
