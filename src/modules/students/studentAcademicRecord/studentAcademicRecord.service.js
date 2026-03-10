import StudentAcademicRecord from '../studentAcademicRecord.model.js';
import Student from '../student.model.js';
import AppError from '../../../utils/appError.js';

const getExpectedSemestersForAcademicYear = ({
  batchStartYear,
  academicYearStartYear,
}) => {
  const yearDifference = academicYearStartYear - batchStartYear;

  if (yearDifference < 0) {
    throw new AppError(
      'Selected academic year is earlier than the student admission batch',
      400
    );
  }

  const firstSemester = yearDifference * 2 + 1;
  const secondSemester = firstSemester + 1;

  if (secondSemester > 8) {
    throw new AppError(
      'Selected academic year is outside the student academic duration',
      400
    );
  }

  return {
    yearDifference,
    validSemesterNumbers: [firstSemester, secondSemester],
  };
};

const validateAcademicYearSemesterMatch = ({ student, academicYear, semesterNumber }) => {
  const normalizedSemesterNumber = Number(semesterNumber);

  if (!Number.isInteger(normalizedSemesterNumber)) {
    throw new AppError('semesterNumber must be an integer', 400);
  }

  if (!student.admissionBatchId?.startYear) {
    throw new AppError('Student admission batch not found', 404);
  }

  const { validSemesterNumbers } = getExpectedSemestersForAcademicYear({
    batchStartYear: student.admissionBatchId.startYear,
    academicYearStartYear: academicYear.startYear,
  });

  if (!validSemesterNumbers.includes(normalizedSemesterNumber)) {
    throw new AppError(
      `Semester ${normalizedSemesterNumber} does not match the selected academic year for this student. Expected semester ${validSemesterNumbers[0]} or ${validSemesterNumbers[1]}.`,
      400
    );
  }

  return normalizedSemesterNumber;
};

const normalizeAcademicRecordPayload = (payload = {}) => {
  const normalized = { ...payload };

  if (normalized.isActive === undefined && normalized.isPromoted !== undefined) {
    normalized.isActive = normalized.isPromoted;
  }

  delete normalized.isPromoted;

  return normalized;
};

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
  const normalizedPayload = normalizeAcademicRecordPayload(payload);

  const student = await Student.findById(normalizedPayload.studentId).populate(
    'admissionBatchId',
    'name startYear endYear'
  );
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  const AcademicYear = (await import('../../academics/academicYear.model.js')).default;
  const academicYear = await AcademicYear.findById(normalizedPayload.academicYearId);
  if (!academicYear) {
    throw new AppError('Academic year not found', 404);
  }

  normalizedPayload.semesterNumber = validateAcademicYearSemesterMatch({
    student,
    academicYear,
    semesterNumber: normalizedPayload.semesterNumber,
  });

  if (normalizedPayload.isActive === true || normalizedPayload.isActive === undefined) {
    await StudentAcademicRecord.updateMany(
      { studentId: normalizedPayload.studentId },
      { $set: { isActive: false } }
    );
  }

  return StudentAcademicRecord.create(normalizedPayload);
};

export const getStudentAcademicRecordsService = async (query) => {
  const filter = buildRecordFilter(query);
  const { page, limit, skip, sort } = parseListOptions(query);

  const [items, total] = await Promise.all([
    StudentAcademicRecord.find(filter)
      .populate('studentId', 'registerNumber')
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
  const normalizedPayload = normalizeAcademicRecordPayload(payload);

  const allowedFields = ['cgpa', 'backlogs', 'isActive'];
  const filteredPayload = Object.fromEntries(
    Object.entries(normalizedPayload).filter(([key]) => allowedFields.includes(key))
  );

  const existingRecord = await StudentAcademicRecord.findById(id).select('studentId');
  if (!existingRecord) {
    throw new AppError('Student academic record not found', 404);
  }

  if (filteredPayload.isActive === true) {
    await StudentAcademicRecord.updateMany(
      { studentId: existingRecord.studentId, _id: { $ne: id } },
      { $set: { isActive: false } }
    );
  }

  const record = await StudentAcademicRecord.findByIdAndUpdate(id, filteredPayload, {
    returnDocument: 'after',
    runValidators: true,
  });

  return record;
};
