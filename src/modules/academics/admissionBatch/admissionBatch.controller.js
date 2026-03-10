import catchAsync from '../../../utils/catchAsync.js';

import {
  createAdmissionBatchService,
  getAdmissionBatchesService,
  getAdmissionBatchByIdService,
  updateAdmissionBatchService,
  deleteAdmissionBatchService,
} from './admissionBatch.service.js';

export const createAdmissionBatch = catchAsync(async (req, res) => {
  const admissionBatch = await createAdmissionBatchService(req.body);

  res.status(201).json({
    status: 'success',
    data: admissionBatch,
  });
});

export const getAdmissionBatches = catchAsync(async (req, res) => {
  const result = await getAdmissionBatchesService(req.query);

  res.status(200).json({
    status: 'success',
    results: result.items.length,
    pagination: result.pagination,
    data: result.items,
  });
});

export const getAdmissionBatchById = catchAsync(async (req, res) => {
  const admissionBatch = await getAdmissionBatchByIdService(req.params.id);

  res.status(200).json({
    status: 'success',
    data: admissionBatch,
  });
});

export const updateAdmissionBatch = catchAsync(async (req, res) => {
  const admissionBatch = await updateAdmissionBatchService(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: admissionBatch,
  });
});

export const deleteAdmissionBatch = catchAsync(async (req, res) => {
  await deleteAdmissionBatchService(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
