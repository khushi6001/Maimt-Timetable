const mongoose = require('mongoose');

// A single timetable entry (one period slot)
const entrySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    periodIndex: {
      type: Number,
      required: true, // 0-based index into the school's period list
    },
    subject: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Subject',
  required: false,
  default: null,
},
teacher: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Teacher',
  required: false,
  default: null,
},
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    isBreak: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const timetableSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
    },
    periods: [
      {
        index: Number,        // 0-based
        label: String,        // "Period 1", "Lunch", etc.
        startTime: String,    // "09:00"
        endTime: String,      // "09:50"
        isBreak: Boolean,
      },
    ],
    // Working days configuration
    workingDays: [
      {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
    ],
    entries: [entrySchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);
timetableSchema.index({ class: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
