import jwt from 'jsonwebtoken';
import ErrorResponse from 'error-module';
import User from '../models/User.js';

async function authenticateUser(req, _res, next) {
   let token;
   //checking if the access token exists
   if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
   ) {
      token = req.headers.authorization.split(' ')[1];
   }
   if (!token) {
      return next(new ErrorResponse('Not Authorized', 401));
   }
   try {
      //verifying the validity token
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(payload.id);
      if (!user) {
         return next(new ErrorResponse('User Not Found', 404));
      }
      req.user = user;
      next();
   } catch (error) {
      next(error);
   }
}

async function verifyRefreshToken(req, _res, next) {
   //to get a new access token you need to have a valid refresh token
   const token = req.cookies.jid;
   if (!token) {
      return next(new ErrorResponse('Error authenticating', 401));
   }

   let payload = null;
   try {
      //verifying the validity of the token
      payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
   } catch (err) {
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
   req.user = user;
   next();
}

export { verifyRefreshToken, authenticateUser };
