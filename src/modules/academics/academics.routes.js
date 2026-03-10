import express from 'express';

import departmentRoutes from './department/department.routes.js';
import admissionBatchRoutes from './admissionBatch/admissionBatch.routes.js';
import academicYearRoutes from './academicYear/academicYear.routes.js';
import sectionRoutes from './section/section.routes.js';
import globalAcademicSettingsRoutes from './globalAcademicSettings/globalAcademicSettings.routes.js';

const router = express.Router();

router.use('/departments', departmentRoutes);
router.use('/batches', admissionBatchRoutes);
router.use('/sections', sectionRoutes);
router.use('/academic-years', academicYearRoutes);
router.use('/academic-settings', globalAcademicSettingsRoutes);

export default router;
