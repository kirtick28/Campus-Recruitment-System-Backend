import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

import router from './routes/index.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';
import AppError from './utils/appError.js';

const app = express();

/*
===================================
SET SECURITY HTTP HEADERS
Helmet helps protect app by setting
secure HTTP headers
===================================
*/

app.use(helmet());

/*
===================================
ENABLE CORS
Allows frontend applications to
communicate with backend
===================================
*/

app.use(cors());

/*
===================================
BODY PARSER
Limits request body size to prevent
large payload attacks
===================================
*/

app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());

/*
===================================
DATA SANITIZATION
Prevents NoSQL injection attacks
===================================
*/

app.use(mongoSanitize());

/*
===================================
XSS PROTECTION
Sanitizes user input from malicious
HTML and JS
===================================
*/

app.use(xss());

/*
===================================
PREVENT PARAMETER POLLUTION
Ensures query params cannot be
duplicated maliciously
===================================
*/

app.use(hpp());

/*
===================================
ENABLE COMPRESSION
Compresses response bodies
for better performance
===================================
*/

app.use(compression());

/*
===================================
REQUEST LOGGER
Logs requests during development
===================================
*/

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/*
===================================
RATE LIMITING
Limits repeated requests
(prevents brute-force attacks)
===================================
*/

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP',
});

app.use('/api', limiter);

/*
===================================
APPLICATION ROUTES
===================================
*/

app.use('/api/v1', router);

/*
===================================
HANDLE UNKNOWN ROUTES
===================================
*/

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

/*
===================================
GLOBAL ERROR HANDLER
===================================
*/

app.use(globalErrorHandler);

export default app;
