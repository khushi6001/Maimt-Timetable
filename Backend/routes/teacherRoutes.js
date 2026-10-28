const express = require("express");
const Teacher = require("../models/Teacher");

const router = express.Router();

// GET: Fetch all teachers
router.get("/", async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Add a teacher
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, contact } = req.body;

    const teacher = await Teacher.create({
      name,
      email,
      subject,
      contact,
    });

    res.status(201).json({
      message: "Teacher added successfully",
      teacher,
    });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      message:
        error.code === 11000
          ? "This email already exists"
          : error.message,
    });
  }
});

// PUT: Update a teacher
router.put("/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({
      message: "Teacher updated successfully",
      teacher,
    });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      message:
        error.code === 11000
          ? "This email already exists"
          : error.message,
    });
  }
});

// DELETE: Delete a teacher
router.delete("/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;