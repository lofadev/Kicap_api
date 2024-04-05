import { Router } from 'express';
import ProductController from '../controllers/ProductController.js';
import { authMiddleWare } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/create', authMiddleWare, ProductController.createProduct);
router.get('/get-all', authMiddleWare, ProductController.getProducts);
router.get('/:id', authMiddleWare, ProductController.getProduct);
router.put('/update/:id', authMiddleWare, ProductController.updateProduct);
router.delete('/delete/:id', authMiddleWare, ProductController.deleteProduct);

export default router;
