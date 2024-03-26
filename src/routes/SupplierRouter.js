import express from 'express';
import SupplierController from '../controllers/SupplierController.js';
import { authMiddleWare } from '../middlewares/authMiddleware.js';
import { validateIdParam } from '../middlewares/validateMiddleware.js';

const router = express.Router();

router.post('/create', authMiddleWare, SupplierController.createSupplier);
router.get('/get-all', authMiddleWare, SupplierController.getSuppliers);
router.get('/:id', validateIdParam, authMiddleWare, SupplierController.getSupplier);
router.put('/update/:id', validateIdParam, authMiddleWare, SupplierController.updateSupplier);
router.delete('/delete/:id', validateIdParam, authMiddleWare, SupplierController.deleteSupplier);

export default router;
