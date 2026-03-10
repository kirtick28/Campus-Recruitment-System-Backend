import Section from '../section.model.js';
import Department from '../department.model.js';
import AdmissionBatch from '../admissionBatch.model.js';
import AppError from '../../../utils/appError.js';

const buildSectionFilter = (query = {}) => {
  const filter = {};

  if (query.name) {
    filter.name = query.name.toUpperCase();
  }

  if (query.departmentId) {
    filter.departmentId = query.departmentId;
  }

  if (query.admissionBatchId) {
    filter.admissionBatchId = query.admissionBatchId;
  }

  if (query.departmentIds) {
    filter.departmentId = {
      $in: query.departmentIds.split(',').map((id) => id.trim()),
    };
  }

  if (query.admissionBatchIds) {
    filter.admissionBatchId = {
      $in: query.admissionBatchIds.split(',').map((id) => id.trim()),
    };
  }

  if (query.ids) {
    filter._id = { $in: query.ids.split(',').map((id) => id.trim()) };
  }

  return filter;
};

const parseListOptions = (query = {}) => {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const sort = query.sort || 'name';

  return { page, limit, skip, sort };
};

const resolveSectionQuery = (query) => {
  if (query.populate === 'true') {
    return Section.find().populate('departmentId').populate('admissionBatchId');
  }

  return Section.find();
};

const ensureReferencesExist = async (departmentId, admissionBatchId) => {
  const [department, admissionBatch] = await Promise.all([
    Department.findById(departmentId),
    AdmissionBatch.findById(admissionBatchId),
  ]);

  if (!department) {
    throw new AppError('Department not found for section', 404);
  }

  if (!admissionBatch) {
    throw new AppError('Admission batch not found for section', 404);
  }
};

export const createSectionService = async (payload) => {
  await ensureReferencesExist(payload.departmentId, payload.admissionBatchId);

  return Section.create(payload);
};

export const getSectionsService = async (query) => {
  const filter = buildSectionFilter(query);
  const { page, limit, skip, sort } = parseListOptions(query);

  const sectionQuery = resolveSectionQuery(query)
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const [items, total] = await Promise.all([
    sectionQuery,
    Section.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getSectionByIdService = async (id, query) => {
  const sectionQuery =
    query.populate === 'true'
      ? Section.findById(id).populate('departmentId').populate('admissionBatchId')
      : Section.findById(id);

  const section = await sectionQuery;

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  return section;
};

export const updateSectionService = async (id, payload) => {
  if (payload.departmentId || payload.admissionBatchId) {
    const current = await Section.findById(id);

    if (!current) {
      throw new AppError('Section not found', 404);
    }

    await ensureReferencesExist(
      payload.departmentId || current.departmentId,
      payload.admissionBatchId || current.admissionBatchId
    );
  }

  const section = await Section.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  return section;
};

export const deleteSectionService = async (id) => {
  const section = await Section.findByIdAndDelete(id);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  return section;
};
