import { Router } from 'express';
import CheckoutController from '../controllers/CheckoutController.js';
const router = Router();

router.post('/create_payment_url', CheckoutController.createPaymentUrl);
router.get('/vnpay_ipn', CheckoutController.vnpayIpn);

export default router;
