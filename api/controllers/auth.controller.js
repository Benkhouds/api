import User from '../models/User.js';
import ErrorResponse from 'error-module';
import { sendAccessToken, sendRefreshToken } from '../utils/sendTokens.js';

export default class AuthController {
   //sending new refresh and accessToken

   static async getRefreshToken(_req, res, _next) {
      sendRefreshToken(res, user.createRefreshToken());
      sendAccessToken(res, user);
   }

   static async register(req, res, next) {
      const { firstName, lastName, email, password } = req.body;
      //TODO:joi validation
      try {
         const user = await User.create({
            firstName,
            lastName,
            email,
            password,
         });
         //attaching an http only cookie to the response containing the refresh token
         sendRefreshToken(res, user.createRefreshToken());
         //sending a 200  response with an access token
         sendAccessToken(res, user);
         //created successfully
      } catch (error) {
         console.log(error);
         next(error);
      }
   }

   static async login(req, res, next) {
      const { email, password } = req.body;
      if (!email || !password) {
         return next(
            new ErrorResponse('Both email and password are required', 400)
         );
      }
      try {
         const user = await User.findOne({ email }).select('+password');

         if (!user) {
            return next(new ErrorResponse('Invalid Credentials', 401));
         }
         const AreMatched = await user.matchPassword(password);
         if (AreMatched) {
            //if the user is authenticated
            sendRefreshToken(res, user.createRefreshToken());
            sendAccessToken(res, user);
         } else {
            return next(new ErrorResponse('Invalid Credentials', 401));
         }
      } catch (error) {
         next(error);
      }
   }

   static async logout(req, res, next) {
      try {
         //revoking the refresh token (incrementing the version)
         const user = await User.findByIdAndUpdate(
            req.user.id,
            { $inc: { tokenVersion: 1 } },
            { new: true }
         );
         if (!user) {
            return next(new ErrorResponse('Forbidden action', 403));
         }
         res.cookie('jid', '', {
            httpOnly: true,
            path: '/api/v1/auth/refresh-token',
         });

         res.status(200).json({ success: true });
      } catch (err) {
         next(err);
      }
   }
}
