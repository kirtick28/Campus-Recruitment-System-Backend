import express from 'express';

import {
  createAdmissionBatch,
  getAdmissionBatches,
  getAdmissionBatchById,
  updateAdmissionBatch,
  deleteAdmissionBatch,
} from './admissionBatch.controller.js';

import { protect, restrictTo } from '../../../middlewares/auth.middleware.js';
import { ROLES } from '../../auth/auth.constants.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAdmissionBatches)
  .post(
    restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER, ROLES.PLACEMENT_STAFF),
    createAdmissionBatch
  );

router
  .route('/:id')
  .get(getAdmissionBatchById)
  .patch(
    restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER, ROLES.PLACEMENT_STAFF),
    updateAdmissionBatch
  )
  .delete(restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER), deleteAdmissionBatch);

export default router;
