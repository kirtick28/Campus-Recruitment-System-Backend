import express from 'express';

import {
  createStudentAcademicRecord,
  getStudentAcademicRecords,
  updateStudentAcademicRecord,
} from './studentAcademicRecord.controller.js';

import { protect, restrictTo } from '../../../middlewares/auth.middleware.js';
import { ROLES } from '../../auth/auth.constants.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getStudentAcademicRecords)
  .post(
    restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER, ROLES.PLACEMENT_STAFF),
    createStudentAcademicRecord
  );

router
  .route('/:id')
  .patch(
    restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER, ROLES.PLACEMENT_STAFF),
    updateStudentAcademicRecord
  );

export default router;
