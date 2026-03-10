import catchAsync from '../../../utils/catchAsync.js';

import {
  getGlobalAcademicSettingsService,
  initGlobalAcademicSettingsService,
  updateSemesterTypeService,
  shiftSemesterService,
} from './globalAcademicSettings.service.js';

export const getGlobalAcademicSettings = catchAsync(async (req, res) => {
  const settings = await getGlobalAcademicSettingsService();

  res.status(200).json({
    status: 'success',
    data: settings,
  });
});

export const initGlobalAcademicSettings = catchAsync(async (req, res) => {
  const settings = await initGlobalAcademicSettingsService(req.body);

  res.status(201).json({
    status: 'success',
    data: settings,
  });
});

export const updateSemesterType = catchAsync(async (req, res) => {
  const settings = await updateSemesterTypeService(req.body);

  res.status(200).json({
    status: 'success',
    data: settings,
  });
});

export const shiftSemester = catchAsync(async (req, res) => {
  const settings = await shiftSemesterService();

  res.status(200).json({
    status: 'success',
    data: settings,
  });
});
