import { Router } from 'express';
import { initializeApp } from 'firebase/app';
import multer from 'multer';
import firebaseConfig from '../configs/firebaseConfig.js';
import ProductController from '../controllers/ProductController.js';
import { authMiddleWare } from '../middlewares/authMiddleware.js';
import {
  validateIdParam,
  validateImage,
  validateImageUpdate,
} from '../middlewares/validateMiddleware.js';

const router = Router();
initializeApp(firebaseConfig);

const upload = multer({ storage: multer.memoryStorage() });
router.post(
  '/create',
  authMiddleWare,
  upload.single('image'),
  validateImage,
  ProductController.createProduct
);
router.get('/get-all', ProductController.getProducts);
router.get('/:id', validateIdParam, ProductController.getProduct);
router.put(
  '/update/:id',
  validateIdParam,
  authMiddleWare,
  upload.single('image'),
  validateImageUpdate,
  ProductController.updateProduct
);
router.delete('/delete/:id', validateIdParam, authMiddleWare, ProductController.deleteProduct);
router.post('/check-quantity', ProductController.checkQuantityProduct);

export default router;
