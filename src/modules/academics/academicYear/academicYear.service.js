import AcademicYear from '../academicYear.model.js';
import AppError from '../../../utils/appError.js';

const buildAcademicYearFilter = (query = {}) => {
  const filter = {};

  if (query.name) {
    filter.name = { $regex: query.name, $options: 'i' };
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
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
  const sort = query.sort || '-startYear';

  return { page, limit, skip, sort };
};

export const createAcademicYearService = async (payload) => {
  if (payload.isActive === true) {
    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (activeYear) {
      throw new AppError(
        'An active academic year already exists. Deactivate it first or create as inactive.',
        400
      );
    }
  }

  return AcademicYear.create(payload);
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

export const getActiveAcademicYearService = async () => {
  const academicYear = await AcademicYear.findOne({ isActive: true });

  if (!academicYear) {
    throw new AppError('No active academic year found', 404);
  }

  return academicYear;
};

export const updateAcademicYearService = async (id, payload) => {
  const existing = await AcademicYear.findById(id);

  if (!existing) {
    throw new AppError('Academic year not found', 404);
  }

  // Cross-field validation for dates
  const updatedStartDate = payload.startDate
    ? new Date(payload.startDate)
    : existing.startDate;
  const updatedEndDate = payload.endDate ? new Date(payload.endDate) : existing.endDate;
  if (updatedEndDate <= updatedStartDate) {
    throw new AppError('endDate must be greater than startDate', 400);
  }

  // Cross-field validation for years
  const updatedStartYear = payload.startYear ?? existing.startYear;
  const updatedEndYear = payload.endYear ?? existing.endYear;
  if (updatedEndYear <= updatedStartYear) {
    throw new AppError('endYear must be greater than startYear', 400);
  }

  // If activating this year, deactivate all others first
  if (payload.isActive === true) {
    await AcademicYear.updateMany(
      { _id: { $ne: id }, isActive: true },
      { $set: { isActive: false } }
    );
  }

  const academicYear = await AcademicYear.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
    runValidators: true,
  });

  return academicYear;
};

export const deleteAcademicYearService = async (id) => {
  const academicYear = await AcademicYear.findByIdAndDelete(id);

  if (!academicYear) {
    throw new AppError('Academic year not found', 404);
  }

  return academicYear;
};
