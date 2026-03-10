import mongoose from 'mongoose';

const SEMESTER_TYPES = ['ODD', 'EVEN'];

const globalAcademicSettingsSchema = new mongoose.Schema(
  {
    currentAcademicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    semesterType: {
      type: String,
      enum: SEMESTER_TYPES,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to enforce singleton — only one settings document can exist
globalAcademicSettingsSchema.pre('save', async function () {
  if (this.isNew) {
    const count = await mongoose.model('GlobalAcademicSettings').countDocuments();
    if (count > 0) {
      const err = new Error(
        'Only one GlobalAcademicSettings document can exist. Use update instead.'
      );
      err.statusCode = 400;
      throw err;
    }
  }
});

const GlobalAcademicSettings = mongoose.model(
  'GlobalAcademicSettings',
  globalAcademicSettingsSchema
);

export default GlobalAcademicSettings;
