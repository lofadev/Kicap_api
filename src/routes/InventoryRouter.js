import { Router } from 'express';
import InventoryController from '../controllers/InventoryController.js';
import { authMiddleWare } from '../middlewares/authMiddleware.js';
import { validateIdParam } from '../middlewares/validateMiddleware.js';

const router = Router();

router.get('/get-all', authMiddleWare, InventoryController.getItemsInInventory);
router.get('/:id', authMiddleWare, validateIdParam, InventoryController.getItemInInventory);
router.put(
  '/update/:id',
  authMiddleWare,
  validateIdParam,
  InventoryController.updateItemInInventory
);
router.delete(
  '/delete/:id',
  authMiddleWare,
  validateIdParam,
  InventoryController.deleteItemInInventory
);

export default router;
