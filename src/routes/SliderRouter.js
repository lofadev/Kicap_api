import express from 'express';
import { initializeApp } from 'firebase/app';
import multer from 'multer';
import firebaseConfig from '../configs/firebaseConfig.js';
import SliderController from '../controllers/SliderController.js';
import { authMiddleWare } from '../middlewares/authMiddleware.js';
import { validateIdParam } from '../middlewares/validateMiddleware.js';

const router = express.Router();
initializeApp(firebaseConfig);

const upload = multer({ storage: multer.memoryStorage() });
router.post('/create', authMiddleWare, upload.single('image'), SliderController.createSlider);
router.get('/get-all', authMiddleWare, SliderController.getSliders);
router.put(
  '/update/:id',
  validateIdParam,
  authMiddleWare,
  upload.single('image'),
  SliderController.updateSlider
);
router.delete('/delete/:id', validateIdParam, authMiddleWare, SliderController.deleteSlider);

export default router;
