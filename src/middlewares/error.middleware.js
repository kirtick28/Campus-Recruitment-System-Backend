const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return {
    statusCode: 400,
    status: 'fail',
    message,
    isOperational: true,
  };
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue ? Object.values(err.keyValue)[0] : '';
  const message = `Duplicate field value: ${value}. Please use another value`;

  return {
    statusCode: 400,
    status: 'fail',
    message,
    isOperational: true,
  };
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;

  return {
    statusCode: 400,
    status: 'fail',
    message,
    isOperational: true,
  };
};

const handleJWTError = () => ({
  statusCode: 401,
  status: 'fail',
  message: 'Invalid token. Please log in again',
  isOperational: true,
});

const handleJWTExpiredError = () => ({
  statusCode: 401,
  status: 'fail',
  message: 'Your token has expired. Please log in again',
  isOperational: true,
});

/*
============================
SEND ERROR IN DEVELOPMENT
============================
*/

const sendErrorDev = (err, res) => {
  console.error('ERROR 💥', err);

  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

/*
============================
SEND ERROR IN PRODUCTION
============================
*/

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 💥', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

/*
============================
GLOBAL ERROR HANDLER
============================
*/

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);

    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();

    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
