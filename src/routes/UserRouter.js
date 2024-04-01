import express from 'express';
import UserController from '../controllers/UserController.js';
import { authMiddleWare, authUserMiddleWare } from '../middlewares/authMiddleware.js';
import { validateIdParam } from '../middlewares/validateMiddleware.js';

const router = express.Router();

router.post('/sign-up', UserController.createUser);
router.post('/sign-in', UserController.loginUser);
router.post('/sign-out', UserController.logoutUser);
router.get('/get-all', authMiddleWare, UserController.getAllUser);
router.get('/:id', validateIdParam, authUserMiddleWare, UserController.getDetailsUser);
router.put('/update/:id', validateIdParam, authUserMiddleWare, UserController.updateUser);
router.delete('/delete/:id', validateIdParam, authMiddleWare, UserController.deleteUser);
router.post('/refresh-token', UserController.refreshToken);

export default router;
