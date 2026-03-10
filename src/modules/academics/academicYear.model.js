import mongoose from 'mongoose';

const academicYearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    startYear: {
      type: Number,
      required: true,
    },
    endYear: {
      type: Number,
      required: true,
      validate: {
        validator(value) {
          const startYear = this?.startYear ?? this?.get?.('startYear');
          if (startYear === undefined) return true;
          return value > startYear;
        },
        message: 'endYear must be greater than startYear',
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          const startDate = this?.startDate ?? this?.get?.('startDate');
          if (startDate === undefined) return true;
          return value > startDate;
        },
        message: 'endDate must be greater than startDate',
      },
    },
  },
  {
    timestamps: true,
  }
);

academicYearSchema.index({ startYear: 1 });

const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);

export default AcademicYear;
