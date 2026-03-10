import catchAsync from '../../../utils/catchAsync.js';

import {
  getAcademicYearsService,
  getAcademicYearByIdService,
  createAcademicYearService,
  updateAcademicYearService,
} from './academicYear.service.js';

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

export const createAcademicYear = catchAsync(async (req, res) => {
  const academicYear = await createAcademicYearService(req.body);

  res.status(201).json({
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
