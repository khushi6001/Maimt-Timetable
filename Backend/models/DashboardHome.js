
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

    room: {
      type: String,
      default: "",
    },

    // Stores each time slot and its subject, teacher and type.
    slots: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// One timetable document per day, class and section.
timetableSchema.index(
  { day: 1, className: 1, section: 1 },
  { unique: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);
