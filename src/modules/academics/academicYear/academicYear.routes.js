import express from 'express';

import {
  getAcademicYears,
  getAcademicYearById,
  createAcademicYear,
  updateAcademicYear,
} from './academicYear.controller.js';

import { protect, restrictTo } from '../../../middlewares/auth.middleware.js';
import { ROLES } from '../../auth/auth.constants.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAcademicYears)
  .post(restrictTo(ROLES.SYSTEM_ADMIN), createAcademicYear);

router
  .route('/:id')
  .get(getAcademicYearById)
  .patch(restrictTo(ROLES.SYSTEM_ADMIN), updateAcademicYear);

export default router;
