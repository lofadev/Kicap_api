import { Router } from 'express';
import VariantController from '../controllers/VariantController.js';
import { authMiddleWare } from '../middlewares/authMiddleware.js';
import { validateIdParam } from '../middlewares/validateMiddleware.js';

const router = Router();

router.post('/create', authMiddleWare, VariantController.createVariant);
router.get('/get-all', VariantController.getVariants);
router.get('/:id', authMiddleWare, validateIdParam, VariantController.getVariant);
router.put('/update/:id', authMiddleWare, validateIdParam, VariantController.updateVariant);
router.delete('/delete/:id', authMiddleWare, validateIdParam, VariantController.deleteVariant);

export default router;
