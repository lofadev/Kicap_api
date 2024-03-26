import express from 'express';
import ShipperController from '../controllers/ShipperController.js';
import { authMiddleWare } from '../middlewares/authMiddleware.js';
import { validateIdParam } from '../middlewares/validateMiddleware.js';

const router = express.Router();

router.post('/create', authMiddleWare, ShipperController.createShipper);
router.get('/get-all', authMiddleWare, ShipperController.getShippers);
router.get('/:id', validateIdParam, authMiddleWare, ShipperController.getShipper);
router.put('/update/:id', validateIdParam, authMiddleWare, ShipperController.updateShipper);
router.delete('/delete/:id', validateIdParam, authMiddleWare, ShipperController.deleteShipper);

export default router;
