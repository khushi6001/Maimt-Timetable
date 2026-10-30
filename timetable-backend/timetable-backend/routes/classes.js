const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', async (req, res) => {
  try {
    const { grade, department, academicYear, search } = req.query;
    const filter = { isActive: true };

    if (grade) filter.grade = grade;
    if (department) filter.department = department;
    if (academicYear) filter.academicYear = academicYear;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const classes = await Class.find(filter)
      .populate('classTeacher', 'name teacherId')
      .populate('subjects.subject', 'name subjectCode')
      .populate('subjects.teacher', 'name teacherId')
      .sort({ grade: 1, name: 1, section: 1 });

    res.json({ success: true, count: classes.length, data: classes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('classTeacher', 'name teacherId email')
      .populate('subjects.subject', 'name subjectCode periodsPerWeek type')
      .populate('subjects.teacher', 'name teacherId department');

    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: cls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json({ success: true, data: cls });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('classTeacher', 'name teacherId')
      .populate('subjects.subject', 'name subjectCode');

    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: cls });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Class.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post('/:id/subjects', async (req, res) => {
  try {
    const { subjects } = req.body; // [{ subject, teacher }]
    const cls = await Class.findByIdAndUpdate(
      req.params.id,
      { subjects },
      { new: true }
    ).populate('subjects.subject', 'name subjectCode').populate('subjects.teacher', 'name');

    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: cls });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
