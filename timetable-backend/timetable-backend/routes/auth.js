const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { name, email, password, role, phone, department } = req.body;

      const exists = await User.findOne({ email });
      if (exists)
        return res.status(400).json({ success: false, message: 'Email already registered' });

      const user = await User.create({ name, email, password, role, phone, department });

      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user)
        return res.status(401).json({ success: false, message: 'Invalid email or password' });

      const isMatch = await user.matchPassword(password);
      if (!isMatch)
        return res.status(401).json({ success: false, message: 'Invalid email or password' });

      if (!user.isActive)
        return res.status(403).json({ success: false, message: 'Account is deactivated' });

      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          department: user.department,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, department, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, department, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
