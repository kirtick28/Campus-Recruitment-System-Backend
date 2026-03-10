import GlobalAcademicSettings from '../globalAcademicSettings.model.js';
import AcademicYear from '../academicYear.model.js';
import AppError from '../../../utils/appError.js';
import mongoose from 'mongoose';

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
  const session = await mongoose.startSession();

  try {
    let createdSettings = null;
    const startDate = payload.startDate || new Date(`${payload.startYear}-06-01`);
    const endDate = payload.endDate || new Date(`${payload.endYear}-05-31`);

    await session.withTransaction(async () => {
      const existing = await GlobalAcademicSettings.findOne().session(session);

      if (existing) {
        throw new AppError(
          'Global academic settings already exist. Initialization is allowed only once.',
          400
        );
      }

      const [academicYear] = await AcademicYear.create(
        [
          {
            name: payload.name,
            startYear: payload.startYear,
            endYear: payload.endYear,
            startDate,
            endDate,
          },
        ],
        { session }
      );

      const [settings] = await GlobalAcademicSettings.create(
        [
          {
            currentAcademicYearId: academicYear._id,
            semesterType: payload.semesterType,
          },
        ],
        { session }
      );

      createdSettings = settings;
    });

    return GlobalAcademicSettings.findById(createdSettings._id).populate(
      'currentAcademicYearId'
    );
  } finally {
    await session.endSession();
  }
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
    settings.semesterType = 'EVEN';
    await settings.save();
  } else {
    const currentYear = settings.currentAcademicYearId;
    const newStartYear = currentYear.endYear;
    const newEndYear = newStartYear + 1;
    const newName = `${newStartYear}-${newEndYear}`;

    // Preserve the current academic-year window pattern while advancing one year
    const durationMs = currentYear.endDate.getTime() - currentYear.startDate.getTime();
    const newStartDate = new Date(currentYear.endDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    const newEndDate = new Date(newStartDate.getTime() + durationMs);

    const newAcademicYear = await AcademicYear.create({
      name: newName,
      startYear: newStartYear,
      endYear: newEndYear,
      startDate: newStartDate,
      endDate: newEndDate,
    });

    settings.currentAcademicYearId = newAcademicYear._id;
    settings.semesterType = 'ODD';
    await settings.save();
  }

  return settings.populate('currentAcademicYearId');
};
