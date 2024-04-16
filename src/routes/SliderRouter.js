import express from 'express';
import { initializeApp } from 'firebase/app';
import multer from 'multer';
import firebaseConfig from '../configs/firebaseConfig.js';
import SliderController from '../controllers/SliderController.js';
import { authMiddleWare } from '../middlewares/authMiddleware.js';
import {
  validateIdParam,
  validateImage,
  validateImageUpdate,
} from '../middlewares/validateMiddleware.js';

const router = express.Router();
initializeApp(firebaseConfig);

const upload = multer({ storage: multer.memoryStorage() });
router.post(
  '/create',
  authMiddleWare,
  upload.single('image'),
  validateImage,
  SliderController.createSlider
);
router.get('/get-all', SliderController.getSliders);
router.get('/:id', authMiddleWare, SliderController.getSlider);
router.put(
  '/update/:id',
  validateIdParam,
  authMiddleWare,
  upload.single('image'),
  validateImageUpdate,
  SliderController.updateSlider
);
router.delete('/delete/:id', validateIdParam, authMiddleWare, SliderController.deleteSlider);

export default router;
