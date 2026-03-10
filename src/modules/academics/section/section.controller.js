import catchAsync from '../../../utils/catchAsync.js';

import {
  createSectionService,
  getSectionsService,
  getSectionByIdService,
  updateSectionService,
  deleteSectionService,
} from './section.service.js';

export const createSection = catchAsync(async (req, res) => {
  const section = await createSectionService(req.body);

  res.status(201).json({
    status: 'success',
    data: section,
  });
});

export const getSections = catchAsync(async (req, res) => {
  const result = await getSectionsService(req.query);

  res.status(200).json({
    status: 'success',
    results: result.items.length,
    pagination: result.pagination,
    data: result.items,
  });
});

export const getSectionById = catchAsync(async (req, res) => {
  const section = await getSectionByIdService(req.params.id, req.query);

  res.status(200).json({
    status: 'success',
    data: section,
  });
});

export const updateSection = catchAsync(async (req, res) => {
  const section = await updateSectionService(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: section,
  });
});

export const deleteSection = catchAsync(async (req, res) => {
  await deleteSectionService(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
