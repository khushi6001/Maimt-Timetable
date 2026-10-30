const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');

const simpleSlotSchema = new mongoose.Schema({
  time:    String,
  type:    { type: String, default: 'lecture' },
  subject: { type: String, default: '' },
  teacher: { type: String, default: '' },
}, { _id: false });

const simpleTimetableSchema = new mongoose.Schema({
  className:    { type: String, required: true },
  section:      { type: String, required: true },
  academicYear: { type: String, required: true },
  day:          { type: String, required: true },
  room:         { type: String, default: '' },
  slots:        [simpleSlotSchema],
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

simpleTimetableSchema.index(
  { className: 1, section: 1, day: 1, academicYear: 1 },
  { unique: true }
);

const SimpleTimetable = mongoose.models.SimpleTimetable ||
  mongoose.model('SimpleTimetable', simpleTimetableSchema);

const slotsObjToArr = (slotsObj = {}) =>
  Object.entries(slotsObj).map(([time, val]) => ({
    time, type: val.type || 'lecture', subject: val.subject || '', teacher: val.teacher || '',
  }));

const slotsArrToObj = (slotsArr = []) => {
  const obj = {};
  slotsArr.forEach(s => { obj[s.time] = { type: s.type, subject: s.subject, teacher: s.teacher }; });
  return obj;
};

const format = (doc) => ({
  id: doc._id, className: doc.className, section: doc.section,
  academicYear: doc.academicYear, day: doc.day, room: doc.room,
  slots: slotsArrToObj(doc.slots),
});

router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.day)          filter.day          = req.query.day;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.className)    filter.className    = req.query.className;
    const docs = await SimpleTimetable.find(filter).sort({ className: 1, section: 1 });
    res.json({ success: true, count: docs.length, data: docs.map(format) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { className, section, academicYear, day, room, slots } = req.body;
    const doc = await SimpleTimetable.findOneAndUpdate(
      { className, section, academicYear, day },
      { room, slots: slotsObjToArr(slots), createdBy: req.user._id },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json({ success: true, data: format(doc) });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Timetable already exists for this class and day' });
    res.status(400).json({ success: false, message: err.message });
  }
});
router.get('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable ID"
      });
    }

    const doc = await SimpleTimetable.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found"
      });
    }

    res.json({
      success: true,
      data: format(doc)
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
router.put('/:id', protect, async (req, res) => {
  try {
    const { room, slots } = req.body;
    const doc = await SimpleTimetable.findByIdAndUpdate(
      req.params.id, { room, slots: slotsObjToArr(slots) }, { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: format(doc) });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await SimpleTimetable.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/', protect, async (req, res) => {
  try {
    const { day, academicYear } = req.query;
    if (!day) return res.status(400).json({ success: false, message: 'day required' });
    const result = await SimpleTimetable.deleteMany({ day, ...(academicYear && { academicYear }) });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;