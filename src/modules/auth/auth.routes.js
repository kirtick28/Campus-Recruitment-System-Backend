import express from 'express';

import {
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
} from './auth.controller.js';

import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/*
AUTH ROUTES
Base: /api/v1/auth
*/

router.post('/login', login);

router.post('/forgot-password', forgotPassword);

router.patch('/reset-password/:token', resetPassword);

router.patch('/update-password', protect, updatePassword);

export default router;
