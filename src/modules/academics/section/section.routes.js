import express from 'express';

import {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
} from './section.controller.js';

import { protect, restrictTo } from '../../../middlewares/auth.middleware.js';
import { ROLES } from '../../auth/auth.constants.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getSections)
  .post(
    restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER, ROLES.PLACEMENT_STAFF),
    createSection
  );

router
  .route('/:id')
  .get(getSectionById)
  .patch(
    restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER, ROLES.PLACEMENT_STAFF),
    updateSection
  )
  .delete(restrictTo(ROLES.SYSTEM_ADMIN, ROLES.PLACEMENT_OFFICER), deleteSection);

export default router;
