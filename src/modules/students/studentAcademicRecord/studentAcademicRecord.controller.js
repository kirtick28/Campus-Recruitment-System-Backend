import catchAsync from '../../../utils/catchAsync.js';

import {
  createStudentAcademicRecordService,
  getStudentAcademicRecordsService,
  updateStudentAcademicRecordService,
} from './studentAcademicRecord.service.js';

export const createStudentAcademicRecord = catchAsync(async (req, res) => {
  const record = await createStudentAcademicRecordService(req.body);

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
  const record = await updateStudentAcademicRecordService(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: record,
  });
});
