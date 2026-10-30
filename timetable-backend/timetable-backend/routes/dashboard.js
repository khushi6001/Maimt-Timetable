const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Room = require('../models/Room');
const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', async (req, res) => {
  try {
    const { academicYear } = req.query;

    const [teachers, classes, rooms, subjects, timetables] = await Promise.all([
      Teacher.countDocuments({ isActive: true }),
      Class.countDocuments({ isActive: true, ...(academicYear && { academicYear }) }),
      Room.countDocuments({ isActive: true }),
      Subject.countDocuments({ isActive: true }),
      Timetable.countDocuments({ ...(academicYear && { academicYear }) }),
    ]);

    const publishedTimetables = await Timetable.countDocuments({
      isPublished: true,
      ...(academicYear && { academicYear }),
    });

    // Department breakdown
    const deptBreakdown = await Teacher.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const completionRate =
      timetables > 0 ? Math.round((publishedTimetables / timetables) * 100) : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalTeachers: teachers,
          totalClasses: classes,
          totalRooms: rooms,
          totalSubjects: subjects,
          totalTimetables: timetables,
          publishedTimetables,
          completionRate,
        },
        departmentBreakdown: deptBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/workload-summary', async (req, res) => {
  try {
    const { academicYear } = req.query;
    const teachers = await Teacher.find({ isActive: true }).select('name teacherId department maxPeriodsPerWeek');
    const timetables = await Timetable.find(academicYear ? { academicYear } : {});

    const workload = {};
    teachers.forEach((t) => {
      workload[t._id.toString()] = { teacher: t, periods: 0 };
    });

    for (const tt of timetables) {
      for (const e of tt.entries) {
        const tid = e.teacher?.toString();
        if (tid && workload[tid]) workload[tid].periods++;
      }
    }

    const overloaded = [];
    const underloaded = [];
    const balanced = [];

    Object.values(workload).forEach((w) => {
      const util = (w.periods / w.teacher.maxPeriodsPerWeek) * 100;
      const item = { ...w, utilizationPercent: Math.round(util) };
      if (util > 100) overloaded.push(item);
      else if (util < 50) underloaded.push(item);
      else balanced.push(item);
    });

    res.json({
      success: true,
      data: {
        overloaded,
        underloaded,
        balanced,
        totalTeachers: teachers.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
