import { useEffect, useMemo, useState } from "react";
import { Row, Col, Container } from "react-bootstrap";
import {
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaChalkboard,
  FaClock,
} from "react-icons/fa";
import "./home.css";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TIME_SLOTS = [
  "09:00-09:50",
  "09:50-10:40",
  "11:00-11:50",
  "11:50-12:40",
  "12:40-01:30",
  "01:30-02:20",
  "02:20-03:10",
  "03:10-04:00",
];

const getToday = () => {
  const day = new Date().getDay();
  return day === 0 ? "Monday" : DAYS[day - 1];
};

const getSlotLabel = (slot) => {
  if (!slot) return "-";
  if (slot.type === "lunch") return "Lunch Break";
  if (slot.type === "break") return "Break";
  if (slot.type === "free") return "Free Slot";
  return slot.subject?.trim() || "-";
};


const loadTimetable = async () => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/timetables"
    );

    if (!response.ok) {
      throw new Error("Unable to fetch timetable");
    }

    const data = await response.json();

    setTimetable(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Unable to load timetable:", error);
    setTimetable([]);
  }
};

export function Dashboardhome() {
  const [timetable, setTimetable] = useState([]);
  const [selectedDay, setSelectedDay] = useState(getToday());

  const loadTimetable = () => {
    try {
      const saved = localStorage.getItem("collegeTimetable");
      const parsed = saved ? JSON.parse(saved) : [];
      setTimetable(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error("Unable to load timetable:", error);
      setTimetable([]);
    }
  };
  useEffect(() => {
    loadTimetable();
    const handleUpdate = () => loadTimetable();
    const handleStorage = (event) => {
      if (
        event.key === "collegeTimetable" ||
        event.key === null
      ) {
        loadTimetable();
      }
    };
    window.addEventListener(
      "collegeTimetableUpdated",
      handleUpdate
    );
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleUpdate);
    return () => {
      window.removeEventListener(
        "collegeTimetableUpdated",
        handleUpdate
      );
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleUpdate);
    };
  }, []);
  const dayRows = useMemo(() => {
    return timetable
      .filter((row) => row.day === selectedDay)
      .sort(
        (a, b) =>
          (a.className || "").localeCompare(b.className || "") ||
          (a.section || "").localeCompare(b.section || "")
      );
  }, [timetable, selectedDay]);
  const todayLectures = useMemo(() => {
    return dayRows.reduce((total, row) => {
      return (
        total +
        TIME_SLOTS.filter((time) => {
          const slot = row.slots?.[time];
          return (
            (!slot?.type || slot.type === "lecture") &&
            Boolean(slot?.subject?.trim())
          );
        }).length
      );
    }, 0);
  }, [dayRows]);
  const freeSlots = useMemo(() => {
    return dayRows.reduce(
      (total, row) =>
        total +
        TIME_SLOTS.filter(
          (time) => row.slots?.[time]?.type === "free"
        ).length,
      0
    );
  }, [dayRows]);
  const totalTeachers = useMemo(() => {
    const teachers = new Set();
    timetable.forEach((row) => {
      TIME_SLOTS.forEach((time) => {
        const slot = row.slots?.[time];
        if (slot?.type && slot.type !== "lecture") return;
        (slot?.teacher || "")
          .split("/")
          .map((name) => name.trim().toLowerCase())
          .filter(Boolean)
          .forEach((name) => teachers.add(name));
      });
    });
    return teachers.size;
  }, [timetable]);
  const totalClasses = useMemo(() => {
    return new Set(
      timetable.map((row) => `${row.className}-${row.section}`)
    ).size;
  }, [timetable]);
  const dateText = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return (
    <Container fluid className="dashboard-content">
      <h2>Dashboard</h2>
      <p>Welcome back 👏</p>
      <div className="d-flex align-items-center gap-3 flex-wrap mb-4">
        <label htmlFor="dashboard-day" className="fw-bold">
          Select Day:
        </label>
        <select id="dashboard-day" className="form-select" style={{ width: "200px" }}value={selectedDay}onChange={(e) => setSelectedDay(e.target.value)}>
          {DAYS.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
        <span className="text-muted">{dateText}</span>
      </div>
      <Row className="g-4 mb-4" id="parent">
        <Col xs={12} sm={6} lg={3}>
          <div className="child">
            <p><FaCalendarAlt /> Lectures — {selectedDay}</p>
            <h3>{todayLectures}</h3>
          </div>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <div className="child">
            <p><FaChalkboardTeacher /> Total Teachers</p>
            <h3>{totalTeachers}</h3>
          </div>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <div className="child">
            <p><FaChalkboard /> Total Classes</p>
            <h3>{totalClasses}</h3>
          </div>
        </Col>
        {/* <Col xs={12} sm={6} lg={3}>
          <div className="child">
            <p><FaClock /> Free Slots — {selectedDay}</p>
            <h3>{freeSlots}</h3>
          </div>
        </Col> */}
      </Row>
      <div className="timetable-box">
        <h4>{selectedDay} Timetable</h4>
        <p>Complete timetable for {selectedDay}</p>
        <div className="table-responsive">
          <table className="simple-table dashboard-timetable">
            <thead>
              <tr>
                <th>Class / Section</th>
                <th>Room No.</th>
                {TIME_SLOTS.map((time) => (
                  <th key={time}>{time}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dayRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={TIME_SLOTS.length + 2}
                    className="text-center"
                  >
                    No timetable saved for {selectedDay}.
                  </td>
                </tr>
              ) : (
                dayRows.map((row, index) => (
                  <tr
                    key={
                      row.id ||
                      `${row.className}-${row.section}-${index}`
                    }
                  >
                    <td>
                      <strong>{row.className || "-"}</strong>
                      <br />
                      Section: {row.section || "-"}
                    </td>
                    <td>{row.room || "-"}</td>
                    {TIME_SLOTS.map((time) => {
                      const slot = row.slots?.[time];
                      const label = getSlotLabel(slot);
                      const isLecture =
                        !slot?.type ||
                        slot.type === "lecture";
                      return (
                        <td
                          key={time}
                          className={
                            slot?.type === "lunch"
                              ? "lunch-cell"
                              : slot?.type === "break"
                              ? "break-cell"
                              : slot?.type === "free"
                              ? "free-cell"
                              : "lecture-cell"
                          }
                        >
                          <div className="slot-subject">
                            {label}
                          </div>

                          {isLecture &&
                            slot?.subject?.trim() && (
                              <div className="slot-teacher">
                                {slot.teacher || "-"}
                              </div>
                            )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
export default Dashboardhome;
