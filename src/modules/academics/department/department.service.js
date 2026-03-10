import Department from '../department.model.js';
import AppError from '../../../utils/appError.js';

const buildDepartmentFilter = (query = {}) => {
  const filter = {};

  if (query.code) {
    filter.code = query.code.toUpperCase();
  }

  if (query.name) {
    filter.name = { $regex: query.name, $options: 'i' };
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

export const createDepartmentService = async (payload) => Department.create(payload);

export const getDepartmentsService = async (query) => {
  const filter = buildDepartmentFilter(query);
  const { page, limit, skip, sort } = parseListOptions(query);

  const [items, total] = await Promise.all([
    Department.find(filter).sort(sort).skip(skip).limit(limit),
    Department.countDocuments(filter),
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

export const getDepartmentByIdService = async (id) => {
  const department = await Department.findById(id);

  if (!department) {
    throw new AppError('Department not found', 404);
  }

  return department;
};

export const updateDepartmentService = async (id, payload) => {
  const department = await Department.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!department) {
    throw new AppError('Department not found', 404);
  }

  return department;
};

export const deleteDepartmentService = async (id) => {
  const department = await Department.findByIdAndDelete(id);

  if (!department) {
    throw new AppError('Department not found', 404);
  }

  return department;
};
