import { Router } from 'express';
import OrderDetailController from '../controllers/OrderDetailController.js';

const router = Router();

router.get('/details-of-order', OrderDetailController.getDetailsOfOrder);
export default router;
