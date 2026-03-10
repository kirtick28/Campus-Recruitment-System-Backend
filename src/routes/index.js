import express from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import academicsRoutes from '../modules/academics/academics.routes.js';
import studentsRoutes from '../modules/students/students.routes.js';

const router = express.Router();

// Authentication routes
router.use('/auth', authRoutes);

// Academic structure routes
router.use('/academics', academicsRoutes);

// Student routes
router.use('/students', studentsRoutes);

router.get('/me', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running',
  });
});

export default router;
