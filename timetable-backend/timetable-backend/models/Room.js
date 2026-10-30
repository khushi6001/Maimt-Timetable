const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['classroom', 'lab', 'seminar_hall', 'lecture_hall', 'auditorium'],
      default: 'classroom',
    },
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: 1,
    },
    building: {
      type: String,
      default: '',
      trim: true,
    },
    floor: {
      type: Number,
      default: 0,
    },
    facilities: [
      {
        type: String,
        enum: ['projector', 'AC', 'smart_board', 'computers', 'lab_equipment'],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
