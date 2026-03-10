import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
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
  },
  {
    timestamps: true,
  }
);

sectionSchema.index({ departmentId: 1 });
sectionSchema.index({ admissionBatchId: 1 });
sectionSchema.index({ departmentId: 1, admissionBatchId: 1, name: 1 }, { unique: true });

const Section = mongoose.model('Section', sectionSchema);

export default Section;
