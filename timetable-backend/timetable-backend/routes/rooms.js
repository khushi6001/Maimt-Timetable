const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Timetable = require('../models/Timetable');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', async (req, res) => {
  try {
    const { type, building, isActive } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (building) filter.building = building;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    else filter.isActive = true;

    const rooms = await Room.find(filter).sort({ building: 1, floor: 1, roomNumber: 1 });
    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post('/', async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    await Room.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Room deactivated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/query/free-slots', async (req, res) => {
  try {
    const { day, periodIndex, academicYear } = req.query;

    if (!day || periodIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: 'day and periodIndex are required',
      });
    }
    const timetables = await Timetable.find(academicYear ? { academicYear } : {});
    const busyRoomIds = new Set();

    for (const tt of timetables) {
      for (const entry of tt.entries) {
        if (
          entry.day === day &&
          entry.periodIndex === parseInt(periodIndex) &&
          entry.room
        ) {
          busyRoomIds.add(entry.room.toString());
        }
      }
    }

    const freeRooms = await Room.find({
      isActive: true,
      _id: { $nin: [...busyRoomIds] },
    });

    res.json({
      success: true,
      day,
      periodIndex: parseInt(periodIndex),
      count: freeRooms.length,
      data: freeRooms,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
