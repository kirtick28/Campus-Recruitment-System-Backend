import express from 'express';
import multer from 'multer';

import {
  createStudent,
  getStudents,
  getStudentById,
  getStudentProfile,
  updateStudent,
  deactivateStudent,
  activateStudent,
  bulkImportStudents,
} from './student.controller.js';

import { protect, restrictTo } from '../../../middlewares/auth.middleware.js';
import { ROLES } from '../../auth/auth.constants.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.post(
  '/import',
  restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER, ROLES.PLACEMENT_STAFF),
  upload.single('file'),
  bulkImportStudents
);

router
  .route('/')
  .get(getStudents)
  .post(
    restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER, ROLES.PLACEMENT_STAFF),
    createStudent
  );

router.get('/:id/profile', getStudentProfile);

router.patch(
  '/:id/deactivate',
  restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER),
  deactivateStudent
);

router.patch(
  '/:id/activate',
  restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER),
  activateStudent
);

router
  .route('/:id')
  .get(getStudentById)
  .patch(
    restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER, ROLES.PLACEMENT_STAFF),
    updateStudent
  );

export default router;
