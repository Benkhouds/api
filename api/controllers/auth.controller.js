import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import { sendAccessToken, sendRefreshToken } from '../utils/sendTokens.js';
import jwt from 'jsonwebtoken';

export default class AuthController {
   //sending new refresh and accessToken

   static async getRefreshToken(req, res, next) {
      //to get a new token you need to already have a valid one
      const token = req.cookies.jid;
      if (!token) {
         return next(new ErrorResponse('Error authenticating', 401));
      }

      let payload = null;
      try {
         //verifying the validity of the token
         payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      } catch (err) {
         console.log(err);
         return next(new ErrorResponse('Error authenticating', 401));
      }

      //finding the user by id (extracted from the token)
      const user = await User.findById(payload.id);

      if (!user) {
         return next(new ErrorResponse('Error authenticating', 401));
      }
      //token version for revoking the access token when needed
      if (user.tokenVersion !== payload.version) {
         return next(new ErrorResponse('Error authenticating', 401));
      }

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
}
