
const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true
    },
    section: {
      type: String,
      required: true,
      enum: ["A", "B", "C"]
    },
    year: {
      type: Number,
      required: true,
      enum: [1, 2, 3]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Class", classSchema);
