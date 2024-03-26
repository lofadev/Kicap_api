import mongoose from 'mongoose';
import variable from '../variable.js';

const validateIdParam = (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(variable.ID_NOTVALID);
  }

  next();
};

export { validateIdParam };
