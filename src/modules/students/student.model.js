import mongoose from 'mongoose';

const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const PLACEMENT_STATUSES = ['NOT_PLACED', 'INTERN', 'PLACED', 'NOT_ELIGIBLE'];

const percentageValidator = {
  validator(value) {
    if (value === undefined || value === null || value === '') {
      return true;
    }

    const normalizedValue = String(value).trim().toUpperCase();
    if (normalizedValue === 'PASS') {
      return true;
    }

    const numericValue = Number(normalizedValue);
    return Number.isFinite(numericValue) && numericValue >= 0 && numericValue <= 100;
  },
  message:
    'Value must be a percentage between 0 and 100, or PASS when exam score is unavailable',
};

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registerNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    personalEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    admissionBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdmissionBatch',
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    gender: {
      type: String,
      enum: GENDERS,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    alternatePhoneNumber: {
      type: String,
      trim: true,
    },
    tenthPercentage: {
      type: String,
      trim: true,
      uppercase: true,
      validate: percentageValidator,
    },
    twelfthPercentage: {
      type: String,
      trim: true,
      uppercase: true,
      validate: percentageValidator,
    },
    placementStatus: {
      type: String,
      enum: PLACEMENT_STATUSES,
      default: 'NOT_PLACED',
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ registerNumber: 1 }, { unique: true });
studentSchema.index({ rollNumber: 1 }, { unique: true });
studentSchema.index({ userId: 1 }, { unique: true });
studentSchema.index({ departmentId: 1 });
studentSchema.index({ admissionBatchId: 1 });
studentSchema.index({ sectionId: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;
