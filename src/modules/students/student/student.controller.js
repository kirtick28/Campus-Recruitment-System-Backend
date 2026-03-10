import catchAsync from '../../../utils/catchAsync.js';
import XLSX from 'xlsx';
import AppError from '../../../utils/appError.js';

import {
  createStudentService,
  getStudentsService,
  getStudentByIdService,
  getStudentProfileService,
  updateStudentService,
  deactivateStudentService,
  activateStudentService,
  bulkImportStudentsService,
} from './student.service.js';

export const createStudent = catchAsync(async (req, res) => {
  const studentPayload = {
    ...req.body,
    registerNumber: req.body.registerNumber,
    rollNumber: req.body.rollNumber,
    personalEmail: req.body.personalEmail,
    address: req.body.address,
    alternatePhoneNumber: req.body.alternatePhoneNumber,
    tenthPercentage: req.body.tenthPercentage,
    twelfthPercentage: req.body.twelfthPercentage,
  };

  const student = await createStudentService(studentPayload);

  res.status(201).json({
    status: 'success',
    data: student,
  });
});

export const getStudents = catchAsync(async (req, res) => {
  const result = await getStudentsService(req.query);

  res.status(200).json({
    status: 'success',
    results: result.items.length,
    pagination: result.pagination,
    data: result.items,
  });
});

export const getStudentById = catchAsync(async (req, res) => {
  const student = await getStudentByIdService(req.params.id);

  res.status(200).json({
    status: 'success',
    data: student,
  });
});

export const getStudentProfile = catchAsync(async (req, res) => {
  const profile = await getStudentProfileService(req.params.id);

  res.status(200).json({
    status: 'success',
    data: profile,
  });
});

export const updateStudent = catchAsync(async (req, res) => {
  const student = await updateStudentService(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: student,
  });
});

export const deactivateStudent = catchAsync(async (req, res) => {
  const result = await deactivateStudentService(req.params.id);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
export const activateStudent = catchAsync(async (req, res) => {
  const result = await activateStudentService(req.params.id);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const bulkImportStudents = catchAsync(async (req, res) => {
  let students = req.body.students || [];

  if (req.file?.buffer) {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new AppError('Uploaded Excel file has no sheets', 400);
    }

    const worksheet = workbook.Sheets[firstSheetName];
    students = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
      raw: false,
      blankrows: false,
      header: 1,
    });

    if (students.length < 2) {
      throw new AppError(
        'Excel file must include header row and at least one data row',
        400
      );
    }

    const [headers, ...rows] = students;
    students = rows.map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        if (header) {
          record[String(header).trim()] = row[index];
        }
      });
      return record;
    });
  }

  if (!Array.isArray(students) || students.length === 0) {
    throw new AppError('Provide students array or upload an Excel file with data', 400);
  }

  const requiredFields = [
    'name',
    'email',
    'registerNumber',
    'rollNumber',
    'departmentCode',
    'batchName',
    'sectionName',
    'gender',
    'dateOfBirth',
    'phoneNumber',
  ];

  const normalizeRow = (row) => ({
    Name: row.name ?? row.Name,
    Email: row.email ?? row.Email,
    RegisterNumber: row.registerNumber ?? row.RegisterNumber,
    RollNumber: row.rollNumber ?? row.RollNumber,
    DepartmentCode: row.departmentCode ?? row.DepartmentCode,
    BatchName: row.batchName ?? row.BatchName,
    SectionName: row.sectionName ?? row.SectionName,
    Gender: row.gender ?? row.Gender,
    DateOfBirth: row.dateOfBirth ?? row.DateOfBirth,
    PhoneNumber: row.phoneNumber ?? row.PhoneNumber,
    PersonalEmail: row.personalEmail ?? row.PersonalEmail,
    AlternatePhoneNumber: row.alternatePhoneNumber ?? row.AlternatePhoneNumber,
    Address: row.address ?? row.Address,
    TenthPercentage: row.tenthPercentage ?? row.TenthPercentage ?? row['10thPercentage'],
    TwelfthPercentage:
      row.twelfthPercentage ?? row.TwelfthPercentage ?? row['12thPercentage'],
    PlacementStatus: row.placementStatus ?? row.PlacementStatus,
  });

  const normalizedStudents = students.map(normalizeRow);

  for (let i = 0; i < normalizedStudents.length; i++) {
    const row = normalizedStudents[i];
    const missing = requiredFields.filter((field) => {
      const keyMap = {
        name: 'Name',
        email: 'Email',
        registerNumber: 'RegisterNumber',
        rollNumber: 'RollNumber',
        departmentCode: 'DepartmentCode',
        batchName: 'BatchName',
        sectionName: 'SectionName',
        gender: 'Gender',
        dateOfBirth: 'DateOfBirth',
        phoneNumber: 'PhoneNumber',
      };

      const value = row[keyMap[field]];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missing.length > 0) {
      throw new AppError(
        `Row ${i + 1}: missing required fields: ${missing.join(', ')}`,
        400
      );
    }
  }

  const result = await bulkImportStudentsService(normalizedStudents);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
