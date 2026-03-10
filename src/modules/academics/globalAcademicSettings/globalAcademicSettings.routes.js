import express from 'express';

import {
  getGlobalAcademicSettings,
  initGlobalAcademicSettings,
  updateSemesterType,
  shiftSemester,
} from './globalAcademicSettings.controller.js';

import { protect, restrictTo } from '../../../middlewares/auth.middleware.js';
import { ROLES } from '../../auth/auth.constants.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getGlobalAcademicSettings);

router.post(
  '/initialize',
  restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER),
  initGlobalAcademicSettings
);

router.patch(
  '/semester',
  restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER),
  updateSemesterType
);

router.post(
  '/shift-semester',
  restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER),
  shiftSemester
);

export default router;
