
const express = require("express");
const router = express.Router();
const Timetable = require("../models/Timetable");

// GET: Fetch all timetable records
router.get("/", async (req, res) => {
  try {
    const timetables = await Timetable.find().sort({
      className: 1,
      section: 1,
    });

    res.status(200).json(timetables);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch timetables",
      error: error.message,
    });
  }
});

// GET: Fetch timetable for a particular day
router.get("/day/:day", async (req, res) => {
  try {
    const timetables = await Timetable.find({
      day: {
        $regex: `^${req.params.day}$`,
        $options: "i",
      },
    }).sort({ className: 1, section: 1 });

    res.status(200).json(timetables);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch day timetable",
      error: error.message,
    });
  }
});

// POST: Create or update one class's timetable for a day
router.post("/", async (req, res) => {
  try {
    const { day, className, section, room, slots } = req.body;

    if (!day || !className || !section) {
      return res.status(400).json({
        message: "Day, class name and section are required",
      });
    }

    const timetable = await Timetable.findOneAndUpdate(
      { day, className, section },
      {
        $set: {
          room: room || "",
          slots: slots || {},
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      message: "Timetable saved successfully",
      timetable,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save timetable",
      error: error.message,
    });
  }
});

// DELETE: Delete one class's timetable for a day
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Timetable.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Timetable not found",
      });
    }

    res.status(200).json({
      message: "Timetable deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete timetable",
      error: error.message,
    });
  }
});

module.exports = router;
