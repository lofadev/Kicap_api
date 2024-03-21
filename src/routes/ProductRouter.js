import express from 'express';
import { initializeApp } from 'firebase/app';
import multer from 'multer';
import firebaseConfig from '../configs/firebaseConfig.js';
import { authMiddleWare } from '../middlewares/authMiddleware.js';
import ProductController from '../controllers/ProductController.js';

const router = express.Router();
initializeApp(firebaseConfig);

const upload = multer({ storage: multer.memoryStorage() });
// router.post('/create', authMiddleWare, upload.single('image'), ProductController.createProduct);
// router.get('/getAll', authMiddleWare, ProductController.getProducts);
// router.put('/update/:id', authMiddleWare, upload.single('image'), ProductController.updateProduct);
// router.delete('/delete/:id', authMiddleWare, ProductController.deleteProduct);

export default router;
