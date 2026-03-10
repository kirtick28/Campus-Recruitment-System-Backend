import catchAsync from '../../../utils/catchAsync.js';

import {
  createDepartmentService,
  getDepartmentsService,
  getDepartmentByIdService,
  updateDepartmentService,
  deleteDepartmentService,
} from './department.service.js';

export const createDepartment = catchAsync(async (req, res) => {
  const department = await createDepartmentService(req.body);

  res.status(201).json({
    status: 'success',
    data: department,
  });
});

export const getDepartments = catchAsync(async (req, res) => {
  const result = await getDepartmentsService(req.query);

  res.status(200).json({
    status: 'success',
    results: result.items.length,
    pagination: result.pagination,
    data: result.items,
  });
});

export const getDepartmentById = catchAsync(async (req, res) => {
  const department = await getDepartmentByIdService(req.params.id);

  res.status(200).json({
    status: 'success',
    data: department,
  });
});

export const updateDepartment = catchAsync(async (req, res) => {
  const department = await updateDepartmentService(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: department,
  });
});

export const deleteDepartment = catchAsync(async (req, res) => {
  await deleteDepartmentService(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
