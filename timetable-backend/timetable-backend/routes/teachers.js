const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const Timetable = require('../models/Timetable');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/', async (req, res) => {
  try {
    const { department, isActive, search } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.name = { $regex: search, $options: 'i' };

    const teachers = await Teacher.find(filter)
      .populate('subjects', 'name subjectCode')
      .sort({ name: 1 });

    res.json({ success: true, count: teachers.length, data: teachers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/teachers/:id
// @desc    Get single teacher
router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('subjects', 'name subjectCode periodsPerWeek');
    if (!teacher)
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, data: teacher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/teachers
// @desc    Create teacher
router.post('/', async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    res.status(201).json({ success: true, data: teacher });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/teachers/:id
// @desc    Update teacher
router.put('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('subjects', 'name subjectCode');
    if (!teacher)
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, data: teacher });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  await Teacher.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Teacher deleted permanently' });
});

// @route   GET /api/teachers/:id/workload
// @desc    Get teacher's workload (number of periods assigned per week)
router.get('/:id/workload', async (req, res) => {
  try {
    const { academicYear } = req.query;
    const filter = {};
    if (academicYear) filter.academicYear = academicYear;

    const timetables = await Timetable.find(filter).populate('class', 'name section grade');

    let totalPeriods = 0;
    const breakdown = []; // per class

    for (const tt of timetables) {
      const teacherEntries = tt.entries.filter(
        (e) => e.teacher && e.teacher.toString() === req.params.id
      );
      if (teacherEntries.length > 0) {
        breakdown.push({
          class: tt.class,
          academicYear: tt.academicYear,
          periods: teacherEntries.length,
          days: [...new Set(teacherEntries.map((e) => e.day))],
        });
        totalPeriods += teacherEntries.length;
      }
    }

    const teacher = await Teacher.findById(req.params.id).select('name maxPeriodsPerWeek');
    if (!teacher)
      return res.status(404).json({ success: false, message: 'Teacher not found' });

    res.json({
      success: true,
      data: {
        teacher,
        totalPeriodsAssigned: totalPeriods,
        maxPeriodsPerWeek: teacher.maxPeriodsPerWeek,
        utilizationPercent: Math.round((totalPeriods / teacher.maxPeriodsPerWeek) * 100),
        breakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/teachers/workload/all
// @desc    Workload summary for all teachers
router.get('/workload/all', async (req, res) => {
  try {
    const { academicYear } = req.query;
    const filter = {};
    if (academicYear) filter.academicYear = academicYear;

    const teachers = await Teacher.find({ isActive: true }).select('name teacherId department maxPeriodsPerWeek');
    const timetables = await Timetable.find(filter);

    const workloadMap = {};
    teachers.forEach((t) => {
      workloadMap[t._id.toString()] = {
        teacher: t,
        totalPeriods: 0,
      };
    });

    for (const tt of timetables) {
      for (const entry of tt.entries) {
        const tid = entry.teacher?.toString();
        if (tid && workloadMap[tid]) {
          workloadMap[tid].totalPeriods++;
        }
      }
    }

    const result = Object.values(workloadMap).map((w) => ({
      ...w,
      utilizationPercent: Math.round((w.totalPeriods / w.teacher.maxPeriodsPerWeek) * 100),
    }));

    res.json({ success: true, count: result.length, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
