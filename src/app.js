import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import rateLimit from 'express-rate-limit';

import router from './routes/index.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';
import AppError from './utils/appError.js';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP',
// });
// app.use('/api', limiter);

app.use('/api/v1', router);

app.all('/{*any}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

export default app;
