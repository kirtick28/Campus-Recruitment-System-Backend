import AdmissionBatch from '../admissionBatch.model.js';
import AppError from '../../../utils/appError.js';

const buildAdmissionBatchFilter = (query = {}) => {
  const filter = {};

  if (query.name) {
    filter.name = { $regex: query.name, $options: 'i' };
  }

  if (query.startYear) {
    filter.startYear = Number(query.startYear);
  }

  if (query.endYear) {
    filter.endYear = Number(query.endYear);
  }

  if (query.startYearGte || query.startYearLte) {
    filter.startYear = {
      ...(query.startYearGte && { $gte: Number(query.startYearGte) }),
      ...(query.startYearLte && { $lte: Number(query.startYearLte) }),
    };
  }

  if (query.endYearGte || query.endYearLte) {
    filter.endYear = {
      ...(query.endYearGte && { $gte: Number(query.endYearGte) }),
      ...(query.endYearLte && { $lte: Number(query.endYearLte) }),
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
  const sort = query.sort || '-startYear';

  return { page, limit, skip, sort };
};

export const createAdmissionBatchService = async (payload) =>
  AdmissionBatch.create(payload);

export const getAdmissionBatchesService = async (query) => {
  const filter = buildAdmissionBatchFilter(query);
  const { page, limit, skip, sort } = parseListOptions(query);

  const [items, total] = await Promise.all([
    AdmissionBatch.find(filter).sort(sort).skip(skip).limit(limit),
    AdmissionBatch.countDocuments(filter),
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

export const getAdmissionBatchByIdService = async (id) => {
  const admissionBatch = await AdmissionBatch.findById(id);

  if (!admissionBatch) {
    throw new AppError('Admission batch not found', 404);
  }

  return admissionBatch;
};

export const updateAdmissionBatchService = async (id, payload) => {
  const existingAdmissionBatch = await AdmissionBatch.findById(id);

  if (!existingAdmissionBatch) {
    throw new AppError('Admission batch not found', 404);
  }

  const updatedStartYear = payload.startYear ?? existingAdmissionBatch.startYear;
  const updatedEndYear = payload.endYear ?? existingAdmissionBatch.endYear;

  if (updatedEndYear <= updatedStartYear) {
    throw new AppError('endYear must be greater than startYear', 400);
  }

  const admissionBatch = await AdmissionBatch.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
    runValidators: true,
  });

  return admissionBatch;
};

export const deleteAdmissionBatchService = async (id) => {
  const admissionBatch = await AdmissionBatch.findByIdAndDelete(id);

  if (!admissionBatch) {
    throw new AppError('Admission batch not found', 404);
  }

  return admissionBatch;
};
