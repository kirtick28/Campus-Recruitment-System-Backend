import catchAsync from '../../../utils/catchAsync.js';

import {
  createAcademicYearService,
  getAcademicYearsService,
  getAcademicYearByIdService,
  getActiveAcademicYearService,
  updateAcademicYearService,
  deleteAcademicYearService,
} from './academicYear.service.js';

export const createAcademicYear = catchAsync(async (req, res) => {
  const academicYear = await createAcademicYearService(req.body);

  res.status(201).json({
    status: 'success',
    data: academicYear,
  });
});

export const getAcademicYears = catchAsync(async (req, res) => {
  const result = await getAcademicYearsService(req.query);

  res.status(200).json({
    status: 'success',
    results: result.items.length,
    pagination: result.pagination,
    data: result.items,
  });
});

export const getAcademicYearById = catchAsync(async (req, res) => {
  const academicYear = await getAcademicYearByIdService(req.params.id);

  res.status(200).json({
    status: 'success',
    data: academicYear,
  });
});

export const getActiveAcademicYear = catchAsync(async (req, res) => {
  const academicYear = await getActiveAcademicYearService();

  res.status(200).json({
    status: 'success',
    data: academicYear,
  });
});

export const updateAcademicYear = catchAsync(async (req, res) => {
  const academicYear = await updateAcademicYearService(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: academicYear,
  });
});

export const deleteAcademicYear = catchAsync(async (req, res) => {
  await deleteAcademicYearService(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
