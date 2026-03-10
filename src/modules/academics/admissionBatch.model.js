import mongoose from 'mongoose';

const admissionBatchSchema = new mongoose.Schema(
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
      min: 1900,
    },
    endYear: {
      type: Number,
      required: true,
      min: 1900,
      validate: {
        validator(value) {
          const startYear = this?.startYear ?? this?.get?.('startYear');
          if (startYear === undefined) return true;
          return value > startYear;
        },
        message: 'endYear must be greater than startYear',
      },
    },
  },
  {
    timestamps: true,
  }
);

admissionBatchSchema.index({ startYear: 1 });

const AdmissionBatch = mongoose.model('AdmissionBatch', admissionBatchSchema);

export default AdmissionBatch;
