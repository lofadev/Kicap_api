import { Router } from 'express';
import AttributeController from '../controllers/AttributeController.js';
import { authMiddleWare } from '../middlewares/authMiddleware.js';
import { validateIdParam } from '../middlewares/validateMiddleware.js';

const router = Router();

router.post('/create', authMiddleWare, AttributeController.createAttribute);
router.get('/get-all', authMiddleWare, AttributeController.getAttributes);
router.get('/:id', authMiddleWare, validateIdParam, AttributeController.getAttribute);
router.put('/update/:id', authMiddleWare, validateIdParam, AttributeController.updateAttribute);
router.delete('/delete/:id', authMiddleWare, validateIdParam, AttributeController.deleteAttribute);

export default router;
