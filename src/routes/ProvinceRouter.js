import { Router } from 'express';
import ProvinceController from '../controllers/ProvinceController.js';
import { validateIdParam } from '../middlewares/validateMiddleware.js';

const router = Router();

router.post('/create', ProvinceController.createProvince);
router.get('/get-all', ProvinceController.getProvinces);
router.get('/:id', validateIdParam, ProvinceController.getProvince);

export default router;
