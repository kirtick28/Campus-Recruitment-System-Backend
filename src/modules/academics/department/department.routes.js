import express from 'express';

import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from './department.controller.js';

import { protect, restrictTo } from '../../../middlewares/auth.middleware.js';
import { ROLES } from '../../auth/auth.constants.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getDepartments)
  .post(
    restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER, ROLES.PLACEMENT_STAFF),
    createDepartment
  );

router
  .route('/:id')
  .get(getDepartmentById)
  .patch(
    restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER, ROLES.PLACEMENT_STAFF),
    updateDepartment
  )
  .delete(restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER), deleteDepartment);

export default router;
