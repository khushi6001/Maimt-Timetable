const express = require("express");
const router = express.Router();
const Timetable = require("../models/Timetable");
router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.weekStart) {
      filter.weekStart = req.query.weekStart;
    }

    if (req.query.academicYear) {
      filter.academicYear = req.query.academicYear;
    }

    const data = await Timetable.find(filter).sort({
      className: 1,
      section: 1,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch timetables",
      error: error.message,
    });
  }
});

// POST: Create or update a class timetable.
router.post("/", async (req, res) => {
  try {
    const {
      day,
      className,
      section,
      academicYear,
      weekStart,
      room,
      slots,
    } = req.body;

    if (
      !day ||
      !className ||
      !section ||
      !academicYear ||
      !weekStart ||
      !room?.trim()
    ) {
      return res.status(400).json({
        message:
          "Day, class, section, academic year, week start and room are required",
      });
    }

    const timetable = await Timetable.findOneAndUpdate(
      {
        day,
        className,
        section,
        academicYear,
        weekStart,
      },
      {
        $set: {
          room: room.trim(),
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
      message: "Unable to save timetable",
      error: error.message,
    });
  }
});

// DELETE: Remove all class timetables for one day and week.
router.delete("/day/:day", async (req, res) => {
  try {
    const { weekStart, academicYear } = req.query;

    if (!weekStart || !academicYear) {
      return res.status(400).json({
        message: "Week start and academic year are required",
      });
    }

    const result = await Timetable.deleteMany({
      day: req.params.day,
      weekStart,
      academicYear,
    });

    res.json({
      message: "Day timetables deleted",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete day timetables",
      error: error.message,
    });
  }
});

// DELETE: Remove one class timetable by MongoDB ID.
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Timetable.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Timetable not found",
      });
    }

    res.json({ message: "Timetable deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete timetable",
      error: error.message,
    });
  }
});

module.exports = router;
