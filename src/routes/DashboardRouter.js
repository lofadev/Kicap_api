import { Router } from 'express';
import DashboardController from '../controllers/DashboardController.js';

const router = Router();

router.get('/get-count', DashboardController.getDashBoard);
router.get('/get-revenue', DashboardController.getRevenue);

export default router;
