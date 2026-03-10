import Student from '../student.model.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../users/user.model.js';
import Department from '../../academics/department.model.js';
import AdmissionBatch from '../../academics/admissionBatch.model.js';
import Section from '../../academics/section.model.js';
import GlobalAcademicSettings from '../../academics/globalAcademicSettings.model.js';
import AppError from '../../../utils/appError.js';

const parseListOptions = (query = {}) => {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 50;
  const skip = (page - 1) * limit;
  const sort = query.sort || 'registerNumber';

  return { page, limit, skip, sort };
};

const resolveBatchIdsForSemester = async (semester, academicYearId) => {
  const semesterNum = Number(semester);

  const settings = await GlobalAcademicSettings.findOne().populate(
    'currentAcademicYearId'
  );
  if (!settings) {
    throw new AppError('Global academic settings not initialized', 400);
  }

  let academicYear;
  if (academicYearId) {
    const AcademicYear = (await import('../../academics/academicYear.model.js')).default;
    academicYear = await AcademicYear.findById(academicYearId);
    if (!academicYear) throw new AppError('Academic year not found', 404);
  } else {
    academicYear = settings.currentAcademicYearId;
  }

  const { semesterType } = settings;
  const isOdd = semesterNum % 2 === 1;

  if ((semesterType === 'ODD' && !isOdd) || (semesterType === 'EVEN' && isOdd)) {
    throw new AppError(
      `Semester ${semesterNum} is not valid for current semester type ${semesterType}`,
      400
    );
  }

  const yearDifference = isOdd ? (semesterNum - 1) / 2 : (semesterNum - 2) / 2;
  const batchStartYear = academicYear.startYear - yearDifference;

  const batches = await AdmissionBatch.find({ startYear: batchStartYear });

  return batches.map((b) => b._id);
};

const buildStudentFilter = async (query = {}) => {
  const filter = {};

  if (query.departmentId) {
    filter.departmentId = query.departmentId;
  }

  if (query.admissionBatchId) {
    filter.admissionBatchId = query.admissionBatchId;
  }

  if (query.sectionId) {
    filter.sectionId = query.sectionId;
  }

  if (query.placementStatus) {
    filter.placementStatus = query.placementStatus;
  }

  if (query.semester) {
    const batchIds = await resolveBatchIdsForSemester(
      query.semester,
      query.academicYearId
    );

    if (batchIds.length === 0) {
      filter._id = null;
    } else if (filter.admissionBatchId) {
      const existing = filter.admissionBatchId.toString();
      if (!batchIds.some((id) => id.toString() === existing)) {
        filter._id = null;
      }
    } else {
      filter.admissionBatchId = { $in: batchIds };
    }
  }

  if (query.search) {
    const searchRegex = { $regex: query.search, $options: 'i' };
    const matchingUsers = await User.find({ name: searchRegex }).select('_id');
    const userIds = matchingUsers.map((u) => u._id);

    filter.$or = [
      { registerNumber: searchRegex },
      { rollNumber: searchRegex },
      { personalEmail: searchRegex },
      { userId: { $in: userIds } },
    ];
  }

  return filter;
};

export const createStudentService = async (payload, options = {}) => {
  const { session } = options;

  const [department, batch, section] = await Promise.all([
    Department.findById(payload.departmentId).session(session),
    AdmissionBatch.findById(payload.admissionBatchId).session(session),
    Section.findById(payload.sectionId).session(session),
  ]);

  if (!department) throw new AppError('Department not found', 404);
  if (!batch) throw new AppError('Admission batch not found', 404);
  if (!section) throw new AppError('Section not found', 404);

  const [user] = await User.create(
    [
      {
        name: payload.name,
        email: payload.email,
        password: 'Welcome@123',
        role: 'STUDENT',
      },
    ],
    { session }
  );

  const [student] = await Student.create(
    [
      {
        userId: user._id,
        registerNumber: payload.registerNumber,
        rollNumber: payload.rollNumber,
        personalEmail: payload.personalEmail,
        address: payload.address,
        departmentId: payload.departmentId,
        admissionBatchId: payload.admissionBatchId,
        sectionId: payload.sectionId,
        gender: payload.gender,
        dateOfBirth: payload.dateOfBirth,
        phoneNumber: payload.phoneNumber,
        placementStatus: payload.placementStatus,
        alternatePhoneNumber: payload.alternatePhoneNumber,
        tenthPercentage: payload.tenthPercentage,
        twelfthPercentage: payload.twelfthPercentage,
      },
    ],
    { session }
  );

  return student;
};

export const getStudentsService = async (query) => {
  const filter = await buildStudentFilter(query);
  const { page, limit, skip, sort } = parseListOptions(query);

  const [items, total] = await Promise.all([
    Student.find(filter)
      .populate('userId', 'name email isActive')
      .populate('departmentId', 'name code')
      .populate('admissionBatchId', 'name startYear endYear')
      .populate('sectionId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Student.countDocuments(filter),
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

export const getStudentByIdService = async (id) => {
  const student = await Student.findById(id)
    .populate('userId', 'name email isActive')
    .populate('departmentId', 'name code')
    .populate('admissionBatchId', 'name startYear endYear')
    .populate('sectionId', 'name');

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  return student;
};

export const getStudentProfileService = async (id) => {
  const StudentAcademicRecord = (await import('../studentAcademicRecord.model.js'))
    .default;

  const student = await Student.findById(id)
    .populate('userId', 'name email isActive')
    .populate('departmentId', 'name code')
    .populate('admissionBatchId', 'name startYear endYear')
    .populate('sectionId', 'name');

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  const academicRecords = await StudentAcademicRecord.find({ studentId: id })
    .populate('academicYearId', 'name startYear endYear')
    .sort('semesterNumber');

  let currentSemester = null;
  const settings = await GlobalAcademicSettings.findOne().populate(
    'currentAcademicYearId'
  );
  if (settings && settings.currentAcademicYearId) {
    const yearDiff =
      settings.currentAcademicYearId.startYear - student.admissionBatchId.startYear;
    currentSemester =
      settings.semesterType === 'ODD' ? yearDiff * 2 + 1 : yearDiff * 2 + 2;
  }

  return {
    student,
    academicRecords,
    currentSemester,
  };
};

export const updateStudentService = async (id, payload) => {
  const student = await Student.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  return student;
};

export const deactivateStudentService = async (id) => {
  const student = await Student.findById(id);

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  await User.findByIdAndUpdate(student.userId, { isActive: false });

  return { message: 'Student deactivated successfully' };
};

export const activateStudentService = async (id) => {
  const student = await Student.findById(id);

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  await User.findByIdAndUpdate(student.userId, { isActive: true });

  return { message: 'Student deactivated successfully' };
};

export const bulkImportStudentsService = async (students) => {
  if (!Array.isArray(students) || students.length === 0) {
    return { created: 0 };
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const [departments, batches, sections] = await Promise.all([
        Department.find().session(session),
        AdmissionBatch.find().session(session),
        Section.find().session(session),
      ]);

      const deptMap = new Map(departments.map((d) => [d.code, d._id]));
      const batchMap = new Map(batches.map((b) => [b.name, b._id]));

      const sectionMap = new Map(
        sections.map((s) => [
          `${s.departmentId.toString()}|${s.admissionBatchId.toString()}|${s.name}`,
          s._id,
        ])
      );

      const seenEmails = new Set();
      const seenRegisterNumbers = new Set();
      const seenRollNumbers = new Set();

      const normalizedRows = students.map((row, index) => {
        const departmentCode = String(row.DepartmentCode || '')
          .trim()
          .toUpperCase();
        const batchName = String(row.BatchName || '').trim();
        const sectionName = String(row.SectionName || '')
          .trim()
          .toUpperCase();
        const email = String(row.Email || '')
          .trim()
          .toLowerCase();
        const registerNumber = String(row.RegisterNumber || '')
          .trim()
          .toUpperCase();
        const rollNumber = String(row.RollNumber || '')
          .trim()
          .toUpperCase();

        const departmentId = deptMap.get(departmentCode);
        if (!departmentId) {
          throw new AppError(
            `Row ${index + 1}: Department code '${row.DepartmentCode}' not found`,
            400
          );
        }

        const admissionBatchId = batchMap.get(batchName);
        if (!admissionBatchId) {
          throw new AppError(`Row ${index + 1}: Batch '${row.BatchName}' not found`, 400);
        }

        const sectionId = sectionMap.get(
          `${departmentId.toString()}|${admissionBatchId.toString()}|${sectionName}`
        );
        if (!sectionId) {
          throw new AppError(
            `Row ${index + 1}: Section '${row.SectionName}' not found for given department and batch`,
            400
          );
        }

        if (seenEmails.has(email)) {
          throw new AppError(`Row ${index + 1}: Duplicate email '${email}' in file`, 400);
        }
        if (seenRegisterNumbers.has(registerNumber)) {
          throw new AppError(
            `Row ${index + 1}: Duplicate registerNumber '${registerNumber}' in file`,
            400
          );
        }
        if (seenRollNumbers.has(rollNumber)) {
          throw new AppError(
            `Row ${index + 1}: Duplicate rollNumber '${rollNumber}' in file`,
            400
          );
        }

        seenEmails.add(email);
        seenRegisterNumbers.add(registerNumber);
        seenRollNumbers.add(rollNumber);

        return {
          name: row.Name,
          email,
          registerNumber,
          rollNumber,
          personalEmail: row.PersonalEmail,
          address: row.Address,
          departmentId,
          admissionBatchId,
          sectionId,
          gender: String(row.Gender || '')
            .trim()
            .toUpperCase(),
          dateOfBirth: row.DateOfBirth,
          phoneNumber: String(row.PhoneNumber),
          alternatePhoneNumber:
            row.AlternatePhoneNumber || row.AlternatePhone || row.AlternatePhoneNo,
          tenthPercentage: row.TenthPercentage || row['10thPercentage'],
          twelfthPercentage: row.TwelfthPercentage || row['12thPercentage'],
          placementStatus: row.PlacementStatus,
        };
      });

      const [existingUsers, existingStudentsByReg, existingStudentsByRoll] =
        await Promise.all([
          User.find({ email: { $in: [...seenEmails] } })
            .select('email')
            .session(session),
          Student.find({ registerNumber: { $in: [...seenRegisterNumbers] } })
            .select('registerNumber')
            .session(session),
          Student.find({ rollNumber: { $in: [...seenRollNumbers] } })
            .select('rollNumber')
            .session(session),
        ]);

      if (existingUsers.length > 0) {
        throw new AppError(
          `Email already exists: ${existingUsers[0].email}. Bulk import aborted.`,
          400
        );
      }

      if (existingStudentsByReg.length > 0) {
        throw new AppError(
          `Register number already exists: ${existingStudentsByReg[0].registerNumber}. Bulk import aborted.`,
          400
        );
      }

      if (existingStudentsByRoll.length > 0) {
        throw new AppError(
          `Roll number already exists: ${existingStudentsByRoll[0].rollNumber}. Bulk import aborted.`,
          400
        );
      }

      const defaultPasswordHash = await bcrypt.hash('Welcome@123', 12);

      const insertedUsers = await User.insertMany(
        normalizedRows.map((row) => ({
          name: row.name,
          email: row.email,
          password: defaultPasswordHash,
          role: 'STUDENT',
        })),
        { session, ordered: true }
      );

      const userByEmail = new Map(insertedUsers.map((u) => [u.email, u._id]));

      await Student.insertMany(
        normalizedRows.map((row) => ({
          userId: userByEmail.get(row.email),
          registerNumber: row.registerNumber,
          rollNumber: row.rollNumber,
          personalEmail: row.personalEmail,
          address: row.address,
          departmentId: row.departmentId,
          admissionBatchId: row.admissionBatchId,
          sectionId: row.sectionId,
          gender: row.gender,
          dateOfBirth: row.dateOfBirth,
          phoneNumber: row.phoneNumber,
          alternatePhoneNumber: row.alternatePhoneNumber,
          tenthPercentage: row.tenthPercentage,
          twelfthPercentage: row.twelfthPercentage,
          ...(row.placementStatus && { placementStatus: row.placementStatus }),
        })),
        { session, ordered: true }
      );
    });

    return { created: students.length };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (
      String(error?.message || '').includes('Transaction numbers are only allowed') ||
      String(error?.message || '').includes('replica set')
    ) {
      throw new AppError(
        'Atomic bulk import requires MongoDB replica set configuration (transactions).',
        500
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }
};
