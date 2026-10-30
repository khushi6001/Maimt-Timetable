const mongoose = require('mongoose');
const teacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Teacher name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    // Maximum periods per week the teacher can teach
    maxPeriodsPerWeek: {
      type: Number,
      default: 30,
    },
    // Availability: days and time slots the teacher is available
    availability: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        },
        slots: [Number], // Array of period indices (0-based)
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    qualification: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Virtual: calculate current workload
teacherSchema.virtual('currentWorkload', {
  ref: 'Timetable',
  localField: '_id',
  foreignField: 'entries.teacher',
  count: true,
});

module.exports = mongoose.model('Teacher', teacherSchema);
