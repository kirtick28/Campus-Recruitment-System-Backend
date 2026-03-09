import express from 'express';

import authRoutes from '../modules/auth/auth.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.get('/me', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running',
  });
});

export default router;
