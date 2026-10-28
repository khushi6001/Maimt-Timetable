const mongoose = require("mongoose");
const timetableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    academicYear: {
      type: String,
      default: "2026-27",
    },
    weekStart: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: true,
      trim: true,
    },
    slots: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

timetableSchema.index(
  {
    weekStart: 1,
    academicYear: 1,
    day: 1,
    className: 1,
    section: 1,
  },
  { unique: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);
