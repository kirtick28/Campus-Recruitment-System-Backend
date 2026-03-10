import express from 'express';

import studentRoutes from './student/student.routes.js';
import studentAcademicRecordRoutes from './studentAcademicRecord/studentAcademicRecord.routes.js';

const router = express.Router();

router.use('/', studentRoutes);
router.use('/academic-records', studentAcademicRecordRoutes);

export default router;
