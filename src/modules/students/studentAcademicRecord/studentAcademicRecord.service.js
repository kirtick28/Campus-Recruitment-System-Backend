import StudentAcademicRecord from '../studentAcademicRecord.model.js';
import Student from '../student.model.js';
import AppError from '../../../utils/appError.js';

const buildRecordFilter = (query = {}) => {
  const filter = {};

  if (query.studentId) {
    filter.studentId = query.studentId;
  }

  if (query.academicYearId) {
    filter.academicYearId = query.academicYearId;
  }

  if (query.semesterNumber) {
    filter.semesterNumber = Number(query.semesterNumber);
  }

  return filter;
};

const parseListOptions = (query = {}) => {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 50;
  const skip = (page - 1) * limit;
  const sort = query.sort || 'semesterNumber';

  return { page, limit, skip, sort };
};

export const createStudentAcademicRecordService = async (payload) => {
  const student = await Student.findById(payload.studentId);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  const AcademicYear = (await import('../../academics/academicYear.model.js')).default;
  const academicYear = await AcademicYear.findById(payload.academicYearId);
  if (!academicYear) {
    throw new AppError('Academic year not found', 404);
  }

  return StudentAcademicRecord.create(payload);
};

export const getStudentAcademicRecordsService = async (query) => {
  const filter = buildRecordFilter(query);
  const { page, limit, skip, sort } = parseListOptions(query);

  const [items, total] = await Promise.all([
    StudentAcademicRecord.find(filter)
      .populate('studentId', 'registerNumber rollNumber')
      .populate('academicYearId', 'name startYear endYear')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    StudentAcademicRecord.countDocuments(filter),
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

export const updateStudentAcademicRecordService = async (id, payload) => {
  const record = await StudentAcademicRecord.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!record) {
    throw new AppError('Student academic record not found', 404);
  }

  return record;
};
