
const express = require("express");
const router = express.Router();

const Class = require("../models/Class");

// GET: Fetch all classes
router.get("/", async (req, res) => {
  try {
    const classes = await Class.find().sort({ createdAt: 1 });
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch classes"
    });
  }
});

// POST: Add a new class
router.post("/", async (req, res) => {
  try {
    const { className, section, year } = req.body;

    if (
      typeof className !== "string" ||
      !className.trim() ||
      !["A", "B", "C"].includes(section) ||
      ![1, 2, 3].includes(Number(year))
    ) {
      return res.status(400).json({
        message: "Please enter valid class details"
      });
    }

    const newClass = await Class.create({
      className: className.trim(),
      section,
      year: Number(year)
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({
      message: "Failed to add class"
    });
  }
});

// PUT: Update a class
router.put("/:id", async (req, res) => {
  try {
    const { className, section, year } = req.body;

    if (
      typeof className !== "string" ||
      !className.trim() ||
      !["A", "B", "C"].includes(section) ||
      ![1, 2, 3].includes(Number(year))
    ) {
      return res.status(400).json({
        message: "Please enter valid class details"
      });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      {
        className: className.trim(),
        section,
        year: Number(year)
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedClass) {
      return res.status(404).json({
        message: "Class not found"
      });
    }

    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(error.name === "CastError" ? 400 : 500).json({
      message: "Failed to update class"
    });
  }
});

// DELETE: Delete a class
router.delete("/:id", async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(
      req.params.id
    );

    if (!deletedClass) {
      return res.status(404).json({
        message: "Class not found"
      });
    }

    res.status(200).json({
      message: "Class deleted successfully"
    });
  } catch (error) {
    res.status(error.name === "CastError" ? 400 : 500).json({
      message: "Failed to delete class"
    });
  }
});

module.exports = router;
