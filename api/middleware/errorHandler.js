import ErrorResponse from '../utils/errorResponse.js';

const errorHandler = (err, req, res, next) => {
   if (err instanceof ErrorResponse) {
      return res.status(err.statusCode).json({
         success: false,
         error: err.message,
      });
   }

   //making a copy of the existing error
   //and we change its value if we encounter on of the following errors
   //this is just for development purposes
   //in production if the error is not identified i would send a 500 internal server error
   //also if i had more time i would've used winston for logging
   //and separated the Production environment with the development one

   let error = { ...err };

   if (err.code === 11000) {
      const message = 'User already exist';
      error = new ErrorResponse(message, 400);
   }
   if (err.name === 'ValidationError') {
      //mongoose validation
      const message = Object.values(err.errors)
         .map((e) => e.message)
         .join(',');
      error = new ErrorResponse(message, 400);
   }
   if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      error = new ErrorResponse(err.message, 401);
   }
   if (err.name === 'CastError') {
      error = new ErrorResponse('User Not Found', 404);
   }

   res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Server Error',
   });
};

export { errorHandler };
