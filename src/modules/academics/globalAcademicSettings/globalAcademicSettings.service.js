import GlobalAcademicSettings from '../globalAcademicSettings.model.js';
import AcademicYear from '../academicYear.model.js';
import AppError from '../../../utils/appError.js';

export const getGlobalAcademicSettingsService = async () => {
  const settings = await GlobalAcademicSettings.findOne().populate(
    'currentAcademicYearId'
  );

  if (!settings) {
    throw new AppError(
      'Global academic settings not found. Please initialize settings.',
      404
    );
  }

  return settings;
};

export const initGlobalAcademicSettingsService = async (payload) => {
  const existing = await GlobalAcademicSettings.findOne();

  if (existing) {
    throw new AppError(
      'Global academic settings already exist. Use update instead.',
      400
    );
  }

  const academicYear = await AcademicYear.findById(payload.currentAcademicYearId);
  if (!academicYear) {
    throw new AppError('Academic year not found', 404);
  }

  return GlobalAcademicSettings.create(payload);
};

export const updateSemesterTypeService = async (payload) => {
  const settings = await GlobalAcademicSettings.findOne();

  if (!settings) {
    throw new AppError(
      'Global academic settings not found. Please initialize first.',
      404
    );
  }

  if (!['ODD', 'EVEN'].includes(payload.semesterType)) {
    throw new AppError('semesterType must be ODD or EVEN', 400);
  }

  settings.semesterType = payload.semesterType;
  await settings.save();

  return settings.populate('currentAcademicYearId');
};

export const shiftSemesterService = async () => {
  const settings = await GlobalAcademicSettings.findOne().populate(
    'currentAcademicYearId'
  );

  if (!settings) {
    throw new AppError(
      'Global academic settings not found. Please initialize first.',
      404
    );
  }

  if (settings.semesterType === 'ODD') {
    // ODD → EVEN: only flip semester type, same academic year
    settings.semesterType = 'EVEN';
    await settings.save();
  } else {
    // EVEN → ODD: create new academic year, update settings
    const currentYear = settings.currentAcademicYearId;
    const newStartYear = currentYear.endYear;
    const newEndYear = newStartYear + 1;
    const newName = `${newStartYear}-${newEndYear}`;

    // Deactivate old academic year
    await AcademicYear.updateMany({ isActive: true }, { $set: { isActive: false } });

    const newAcademicYear = await AcademicYear.create({
      name: newName,
      startYear: newStartYear,
      endYear: newEndYear,
      startDate: new Date(`${newStartYear}-06-01`),
      endDate: new Date(`${newEndYear}-05-31`),
      isActive: true,
    });

    settings.currentAcademicYearId = newAcademicYear._id;
    settings.semesterType = 'ODD';
    await settings.save();
  }

  return settings.populate('currentAcademicYearId');
};
