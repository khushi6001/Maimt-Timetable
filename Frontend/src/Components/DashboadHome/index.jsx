
import { useEffect, useState } from "react";
import { Row, Col, Container } from "react-bootstrap";

import {
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaChalkboard,
  FaClock,
} from "react-icons/fa";

import "./home.css";

const API_URL = "http://localhost:5000/api";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const PERIODS = [
  "09:00-09:50",
  "09:50-10:40",
  "11:00-11:50",
  "11:50-12:40",
  "12:40-01:30",
  "01:30-02:20",
  "02:20-03:10",
  "03:10-04:00",
];

// Automatically get today's day
const getToday = () => {
  const day = new Date().getDay();

  if (day === 0) return "Monday";

  return DAYS[day - 1];
};

// Format today's date
const getDate = () => {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Get slot data safely
const getSlot = (slots, period) => {
  if (!slots) return null;

  const key = Object.keys(slots).find(
    (item) => item.replace(/\s/g, "").toLowerCase() ===
      period.replace(/\s/g, "").toLowerCase()
  );

  return key ? slots[key] : null;
};

// Show subject and teacher
const getValue = (value) => {
  if (!value) return "";

  if (typeof value === "object") {
    return value.name || value.subjectName || "";
  }

  return value;
};

export function Dashboardhome() {

  const [selectedDay, setSelectedDay] = useState(getToday());

  const [timetables, setTimetables] = useState([]);

  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Fetch all timetables
  useEffect(() => {

    const loadDashboard = async () => {

      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      try {

        // Fetch complete timetable list
        const response = await fetch(
          `${API_URL}/simple-timetable?academicYear=2026-27`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Timetable API error: " + response.status);
        }

        const result = await response.json();

        setTimetables(
          Array.isArray(result.data) ? result.data : []
        );

      } catch (err) {

        console.error("Timetable Error:", err);

        setError(
          "Timetable load nahi hua. Backend API check karein."
        );

      }

      // Stats are independent of timetable loading
      try {

        const statsResponse = await fetch(
          `${API_URL}/dashboard/stats?academicYear=2026-27`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (statsResponse.ok) {

          const statsResult = await statsResponse.json();

          setStats(statsResult.data);

        }

      } catch (err) {

        console.error("Stats Error:", err);

      } finally {

        setLoading(false);

      }

    };

    loadDashboard();

  }, []);

  // Automatically filter today's selected day
  const dayTimetables = timetables.filter(
    (item) => item.day?.toLowerCase() === selectedDay.toLowerCase()
  );

  // Total lectures for selected day
  const totalLectures = dayTimetables.reduce(
    (total, item) => {

      const count = Object.values(item.slots || {}).filter(
        (slot) =>
          slot &&
          slot.type !== "break" &&
          slot.type !== "lunch" &&
          (slot.subject || slot.teacher)
      ).length;

      return total + count;

    },
    0
  );

  return (

    <Container fluid className="dashboard-content">

      <h2>Dashboard</h2>

      <p>Welcome back 👏</p>

      {error && (
        <div
          style={{
            color: "red",
            background: "#fef2f2",
            padding: 12,
            borderRadius: 6,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* Day Selection */}

      <div className="d-flex align-items-center gap-3 flex-wrap mb-4">

        <label className="fw-bold">
          Select Day:
        </label>

        <select
          className="form-select"
          style={{ width: "230px" }}
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
        >

          {DAYS.map((day) => (

            <option key={day} value={day}>
              {day}
            </option>

          ))}

        </select>

        <span className="text-muted">
          {getDate()}
        </span>

      </div>

      {/* Dashboard Cards */}
{/* 
      <Row className="g-4 mb-4" id="parent">

        <Col xs={12} sm={6} lg={3}>

          <div className="child">

            <p>
              <FaCalendarAlt /> Lectures — {selectedDay}
            </p>

            <h3>{loading ? "..." : totalLectures}</h3>

          </div>

        </Col>

        <Col xs={12} sm={6} lg={3}>

          <div className="child">

            <p>
              <FaChalkboardTeacher /> Total Teachers
            </p>

            <h3>
              {stats?.summary?.totalTeachers ?? "—"}
            </h3>

          </div>

        </Col>

        <Col xs={12} sm={6} lg={3}>

          <div className="child">

            <p>
              <FaChalkboard /> Total Classes
            </p>

            <h3>
              {stats?.summary?.totalClasses ?? "—"}
            </h3>

          </div>

        </Col>

        <Col xs={12} sm={6} lg={3}>

          <div className="child">

            <p>
              <FaClock /> Published Timetables
            </p>

            <h3>
              {stats?.summary?.publishedTimetables ?? "—"}
            </h3>

          </div>

        </Col>

      </Row> */}

      {/* Today's Complete Timetable */}

      <div className="timetable-box">

        <h4>
          {selectedDay} Timetable
        </h4>

        <p className="text-muted">
          Complete Class Timetable — {getDate()}
        </p>

        {loading ? (

          <p>Loading timetable...</p>

        ) : (

          <div className="table-responsive">

            <table className="simple-table dashboard-timetable">

              <thead>

                <tr>

                  <th>Class / Section</th>

                  <th>Room No.</th>

                  {PERIODS.map((period) => (

                    <th key={period}>
                      {period}
                    </th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {dayTimetables.length === 0 ? (

                  <tr>

                    <td
                      colSpan={PERIODS.length + 2}
                      className="text-center"
                    >
                      No timetable available for {selectedDay}
                    </td>

                  </tr>

                ) : (

                  dayTimetables.map((item) => (

                    <tr key={item.id || item._id}>

                      <td>
                        <strong>
                          {item.className} / {item.section}
                        </strong>
                      </td>

                      <td>
                        {item.room || "—"}
                      </td>

                      {PERIODS.map((period) => {

                        const slot = getSlot(item.slots, period);

                        return (

                          <td key={period}>

                            {slot?.type === "break" ||
                            slot?.type === "lunch" ? (

                              <strong>
                                {slot.type === "lunch" ? "Lunch" : "Break"}
                              </strong>

                            ) : slot ? (

                              <div>

                                <strong>
                                  {getValue(slot.subject) || "—"}
                                </strong>

                                <br />

                                <small>
                                  {getValue(slot.teacher)}
                                </small>

                              </div>

                            ) : (

                              <span>Free</span>

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

        )}

      </div>

    </Container>

  );

}

export default Dashboardhome;
