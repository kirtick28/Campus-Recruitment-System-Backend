import AcademicYear from '../academicYear.model.js';
import AppError from '../../../utils/appError.js';

const buildAcademicYearFilter = (query = {}) => {
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

  if (query.startDateFrom || query.startDateTo) {
    filter.startDate = {
      ...(query.startDateFrom && { $gte: new Date(query.startDateFrom) }),
      ...(query.startDateTo && { $lte: new Date(query.startDateTo) }),
    };
  }

  if (query.endDateFrom || query.endDateTo) {
    filter.endDate = {
      ...(query.endDateFrom && { $gte: new Date(query.endDateFrom) }),
      ...(query.endDateTo && { $lte: new Date(query.endDateTo) }),
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
  const sort = query.sort || '-createdAt';

  return { page, limit, skip, sort };
};

export const getAcademicYearsService = async (query) => {
  const filter = buildAcademicYearFilter(query);
  const { page, limit, skip, sort } = parseListOptions(query);

  const [items, total] = await Promise.all([
    AcademicYear.find(filter).sort(sort).skip(skip).limit(limit),
    AcademicYear.countDocuments(filter),
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

export const getAcademicYearByIdService = async (id) => {
  const academicYear = await AcademicYear.findById(id);

  if (!academicYear) {
    throw new AppError('Academic year not found', 404);
  }

  return academicYear;
};

export const createAcademicYearService = async (payload) => {
  const academicYearPayload = {
    name: payload.name,
    startYear: Number(payload.startYear),
    endYear: Number(payload.endYear),
    startDate: payload.startDate,
    endDate: payload.endDate,
  };

  return AcademicYear.create(academicYearPayload);
};

export const updateAcademicYearService = async (id, payload) => {
  const allowedFields = ['name', 'startYear', 'endYear', 'startDate', 'endDate'];
  const filteredPayload = Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedFields.includes(key))
  );

  if (filteredPayload.startYear !== undefined) {
    filteredPayload.startYear = Number(filteredPayload.startYear);
  }

  if (filteredPayload.endYear !== undefined) {
    filteredPayload.endYear = Number(filteredPayload.endYear);
  }

  const academicYear = await AcademicYear.findByIdAndUpdate(id, filteredPayload, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!academicYear) {
    throw new AppError('Academic year not found', 404);
  }

  return academicYear;
};
