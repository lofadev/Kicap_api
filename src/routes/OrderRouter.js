import { Router } from 'express';
import OrderController from '../controllers/OrderController.js';

const router = Router();

router.post('/create', OrderController.createOrder);
router.put('/update/:id', OrderController.updateOrder);
router.delete('/delete/:id', OrderController.deleteOrder);
router.get('/get-all', OrderController.getAll);
router.get('/:id', OrderController.getOrder);

export default router;
