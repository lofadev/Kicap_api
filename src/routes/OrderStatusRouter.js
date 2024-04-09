import { Router } from 'express';
import OrderStatusController from '../controllers/OrderStatusController.js';
import { authMiddleWare } from '../middlewares/authMiddleware.js';
import { validateIdParam } from '../middlewares/validateMiddleware.js';

const router = Router();

router.post('/create', authMiddleWare, OrderStatusController.createOrderStatus);
router.get('/get-all', authMiddleWare, OrderStatusController.getOrderStatuss);
router.get('/:id', authMiddleWare, validateIdParam, OrderStatusController.getOrderStatus);
router.put('/update/:id', authMiddleWare, validateIdParam, OrderStatusController.updateOrderStatus);
router.delete(
  '/delete/:id',
  authMiddleWare,
  validateIdParam,
  OrderStatusController.deleteOrderStatus
);

export default router;
