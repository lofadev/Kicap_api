import { Router } from 'express';
import OrderDetailController from '../controllers/OrderDetailController.js';

const router = Router();

router.get('/details-of-order', OrderDetailController.getDetailsOfOrder);
router.put('/update/:id', OrderDetailController.updateOrderDetails);
router.delete('/delete/:id', OrderDetailController.deleteOrderDetails);

export default router;
