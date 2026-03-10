import mongoose from 'mongoose';

const studentAcademicRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    semesterNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 0,
    },
    backlogs: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isPromoted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

studentAcademicRecordSchema.index({ studentId: 1 });
studentAcademicRecordSchema.index({ academicYearId: 1 });
studentAcademicRecordSchema.index(
  {
    studentId: 1,
    semesterNumber: 1,
  },
  { unique: true }
);

const StudentAcademicRecord = mongoose.model(
  'StudentAcademicRecord',
  studentAcademicRecordSchema
);

export default StudentAcademicRecord;
