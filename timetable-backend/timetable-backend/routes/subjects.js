const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', async (req, res) => {
  try {
    const { department, type, isActive } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const subjects = await Subject.find(filter).sort({ department: 1, name: 1 });
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single subject
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create subject
router.post('/', async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update subject
router.put('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE subject
router.delete('/:id', async (req, res) => {
  try {
    await Subject.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
