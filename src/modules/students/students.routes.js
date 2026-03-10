import express from 'express';

import studentRoutes from './student/student.routes.js';

const router = express.Router();

router.use('/', studentRoutes);

export default router;
