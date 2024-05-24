import { Router } from 'express';
import OrderController from '../controllers/OrderController.js';

const router = Router();

router.post('/create', OrderController.createOrder);
router.get('/get-all', OrderController.getAll);
router.get('/:id', OrderController.getOrder);

export default router;
