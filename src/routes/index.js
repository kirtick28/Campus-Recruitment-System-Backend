import express from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import academicsRoutes from '../modules/academics/academics.routes.js';
import studentsRoutes from '../modules/students/students.routes.js';
import studentAcademicRecordRoutes from '../modules/students/studentAcademicRecord/studentAcademicRecord.routes.js';

const router = express.Router();

// Authentication routes
router.use('/auth', authRoutes);

// Academic structure routes
router.use('/academics', academicsRoutes);

// Student routes
router.use('/students', studentsRoutes);
router.use('/student-academic-records', studentAcademicRecordRoutes);

export default router;
