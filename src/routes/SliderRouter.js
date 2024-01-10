import express from 'express';
import { initializeApp } from 'firebase/app';
import multer from 'multer';
import firebaseConfig from '../configs/firebaseConfig.js';
import SliderController from '../controllers/SliderController.js';
import { authMiddleWare } from '../middlewares/authMiddleware.js';

const router = express.Router();
initializeApp(firebaseConfig);

const upload = multer({ storage: multer.memoryStorage() });
router.post('/create', authMiddleWare, upload.single('image'), SliderController.createSlider);
router.get('/getAll', authMiddleWare, SliderController.getSlider);
router.put('/update/:id', authMiddleWare, upload.single('image'), SliderController.updateSlider);
router.delete('/delete/:id', authMiddleWare, SliderController.deleteSlider);

export default router;
