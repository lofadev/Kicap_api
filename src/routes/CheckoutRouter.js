import { Router } from 'express';
import CheckoutController from '../controllers/CheckoutController.js';
const router = Router();

router.post('/create_payment_url', CheckoutController.createPaymentUrl);
// VNPay gọi IPN server-to-server bằng GET, không phải POST.
router.get('/vnpay_ipn', CheckoutController.vnpayIpn);
// Client POST các tham số nhận được trên URL redirect tới đây để xác minh.
router.post('/vnpay_return', CheckoutController.vnpayReturn);

export default router;
