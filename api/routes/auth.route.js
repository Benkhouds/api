import AuthController from '../controllers/auth.controller.js';
import { Router } from 'express';
const router = Router();

router.route('/register').post(AuthController.register);
router.route('/login').post(AuthController.login);

router.route('/refresh-token').post(AuthController.getRefreshToken);

export default router;
