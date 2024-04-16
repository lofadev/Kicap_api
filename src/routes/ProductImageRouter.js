import { Router } from 'express';
import { initializeApp } from 'firebase/app';
import multer from 'multer';
import firebaseConfig from '../configs/firebaseConfig.js';
import ProductImageController from '../controllers/ProductImageController.js';
import { authMiddleWare } from '../middlewares/authMiddleware.js';
import { validateIdParam, validateImage } from '../middlewares/validateMiddleware.js';

const router = Router();
initializeApp(firebaseConfig);

const upload = multer({ storage: multer.memoryStorage() });
router.post(
  '/create',
  authMiddleWare,
  upload.single('image'),
  validateImage,
  ProductImageController.createProductImage
);
router.get('/max-order', authMiddleWare, ProductImageController.getMaxOrder);
router.get('/get-all', ProductImageController.getProductImages);
router.get('/:id', validateIdParam, authMiddleWare, ProductImageController.getProductImage);
router.put(
  '/update/:id',
  validateIdParam,
  authMiddleWare,
  upload.single('image'),
  ProductImageController.updateProductImage
);
router.delete(
  '/delete/:id',
  validateIdParam,
  authMiddleWare,
  ProductImageController.deleteProductImage
);

export default router;
