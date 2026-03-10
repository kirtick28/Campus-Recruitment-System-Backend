import catchAsync from '../../../utils/catchAsync.js';

import {
  createStudentAcademicRecordService,
  getStudentAcademicRecordsService,
  updateStudentAcademicRecordService,
} from './studentAcademicRecord.service.js';

export const createStudentAcademicRecord = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    ...(req.body.isActive === undefined && req.body.isPromoted !== undefined
      ? { isActive: req.body.isPromoted }
      : {}),
  };

  const record = await createStudentAcademicRecordService(payload);

  res.status(201).json({
    status: 'success',
    data: record,
  });
});

export const getStudentAcademicRecords = catchAsync(async (req, res) => {
  const result = await getStudentAcademicRecordsService(req.query);

  res.status(200).json({
    status: 'success',
    results: result.items.length,
    pagination: result.pagination,
    data: result.items,
  });
});

export const updateStudentAcademicRecord = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    ...(req.body.isActive === undefined && req.body.isPromoted !== undefined
      ? { isActive: req.body.isPromoted }
      : {}),
  };

  const record = await updateStudentAcademicRecordService(req.params.id, payload);

  res.status(200).json({
    status: 'success',
    data: record,
  });
});
