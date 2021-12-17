import ErrorResponse from 'error-module';

const errorHandler = (err, req, res, next) => {
   if (err instanceof ErrorResponse) {
      return res.status(err.statusCode).json({
         success: false,
         error: err.message,
      });
   }

   let error;
   if (err.code === 11000) {
      error = new ErrorResponse('User already exist', 400);
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
