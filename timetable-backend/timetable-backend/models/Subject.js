const mongoose = require('mongoose');
const subjectSchema = new mongoose.Schema(
  {
    subjectCode: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    periodsPerWeek: {
      type: Number,
      required: [true, 'Periods per week is required'],
      min: 1,
    },
    type: {
      type: String,
      enum: ['theory', 'practical', 'both'],
      default: 'theory',
    },
    isElective: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
