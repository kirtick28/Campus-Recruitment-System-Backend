import express from 'express';

import {
  createAcademicYear,
  getAcademicYears,
  getAcademicYearById,
  getActiveAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
} from './academicYear.controller.js';

import { protect, restrictTo } from '../../../middlewares/auth.middleware.js';
import { ROLES } from '../../auth/auth.constants.js';

const router = express.Router();

router.use(protect);

router.get('/active', getActiveAcademicYear);

router
  .route('/')
  .get(getAcademicYears)
  .post(
    restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER, ROLES.PLACEMENT_STAFF),
    createAcademicYear
  );

router
  .route('/:id')
  .get(getAcademicYearById)
  .patch(
    restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER, ROLES.PLACEMENT_STAFF),
    updateAcademicYear
  )
  .delete(restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER), deleteAcademicYear);

export default router;
