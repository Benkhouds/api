import AuthController from '../controllers/auth.controller.js';
import {
   authenticateUser,
   verifyRefreshToken,
} from '../middleware/authenticate.js';

import { Router } from 'express';
const router = Router();

router.route('/register').post(AuthController.register);
router.route('/login').post(AuthController.login);

//getting  new access and refresh tokens requires a valid refresh token
router
   .route('/refresh-token')
   .post(verifyRefreshToken, AuthController.getRefreshToken);

//1)verifying that the refresh token is valid
//2) verifying if the access token is still valid
//===>if the access token gets leaked the hacker can force log out the user
//so i think we need to verify both tokens
router
   .route('/logout')
   .post(verifyRefreshToken, authenticateUser, AuthController.logout);
export default router;
