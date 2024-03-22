import express from 'express';
import ShipperController from '../controllers/ShipperController.js';
import { authMiddleWare } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', authMiddleWare, ShipperController.createShipper);
router.get('/get-all', authMiddleWare, ShipperController.getShippers);
router.get('/:id', authMiddleWare, ShipperController.getShipper);
router.put('/update/:id', authMiddleWare, ShipperController.updateShipper);
router.delete('/delete/:id', authMiddleWare, ShipperController.deleteShipper);

export default router;
