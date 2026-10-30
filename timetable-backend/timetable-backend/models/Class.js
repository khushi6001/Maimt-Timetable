const mongoose = require('mongoose');
const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      uppercase: true,
      trim: true,
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      trim: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    strength: {
      type: Number,
      default: 0,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    subjects: [
      {
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
          required: true,
        },
        teacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Teacher',
          default: null,
        },
      },
    ],
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
classSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
