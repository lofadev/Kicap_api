import express from 'express';
import multer from 'multer';
import SliderController from '../controllers/SliderController.js';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../configs/firebaseConfig.js';
import { authMiddleWare } from '../middlewares/authMiddleware.js';

const router = express.Router();
initializeApp(firebaseConfig);

const upload = multer({ storage: multer.memoryStorage() });
router.post('/create', authMiddleWare, upload.single('image'), SliderController.createSlider);
router.post('/update/:id', authMiddleWare, upload.single('image'), SliderController.updateSlider);
router.post('/delete/:id', authMiddleWare, SliderController.deleteSlider);

export default router;
