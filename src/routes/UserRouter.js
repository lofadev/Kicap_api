import express from 'express';
import UserController from '../controllers/UserController.js';
import { authMiddleWare, authUserMiddleWare } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/sign-up', UserController.createUser);
router.post('/sign-in', UserController.loginUser);
router.post('/sign-out', UserController.logoutUser);
router.put('/update/:id', authUserMiddleWare, UserController.updateUser);
router.delete('/delete/:id', authMiddleWare, UserController.deleteUser);
router.get('/getAll', authMiddleWare, UserController.getAllUser);
router.get('/get-details/:id', authUserMiddleWare, UserController.getDetailsUser);
router.post('/refresh-token', UserController.refreshToken);

export default router;
