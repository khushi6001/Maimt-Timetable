import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import "./workload.css";
const COLORS = [
  "#08764f", "#d43b2d", "#f58220", "#9145b5",
  "#2782bd", "#18a68f", "#899596", "#d95b00",
];
const TIME_SLOTS = [
  "09:00-09:50", "09:50-10:40", "11:00-11:50",
  "11:50-12:40", "01:30-02:20", "02:20-03:10", "03:10-04:00",
];
const DAYS = [
  "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];

export function Workload() {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/simple-timetable", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(json => {
        const timetable = Array.isArray(json.data) ? json.data : [];
        const summary = {};

        // Har weekday kitni baar aata hai is month mein
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const weekdayOccurrences = {};
        DAYS.forEach(day => { weekdayOccurrences[day] = 0; });
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let date = 1; date <= daysInMonth; date++) {
          const dayIndex = (new Date(year, month, date).getDay() + 6) % 7;
          if (dayIndex < 6) weekdayOccurrences[DAYS[dayIndex]]++;
        }

        // Har teacher ka weekly + monthly count
        timetable.forEach(row => {
          if (!DAYS.includes(row.day)) return;
          TIME_SLOTS.forEach(time => {
            const lecture = row.slots?.[time];
            if (!lecture?.subject?.trim() || !lecture?.teacher?.trim()) return;

            lecture.teacher
              .split("/")
              .map(n => n.trim())
              .filter(Boolean)
              .forEach(name => {
                const key = name.toLowerCase();
                if (!summary[key]) {
                  summary[key] = {
                    name,
                    weekly: 0,
                    monthly: 0,
                    color: COLORS[Object.keys(summary).length % COLORS.length],
                  };
                }
                summary[key].weekly++;
                summary[key].monthly += weekdayOccurrences[row.day];
              });
          });
        });

        setTeachers(Object.values(summary));
      })
      .catch(err => {
        console.error("Workload load nahi hua:", err);
        setTeachers([]);
      });
  }, []);

  const maxLectures = Math.max(1, ...teachers.map(t => t.monthly));

  return (
    <div className="workload-page">
      <div className="workload-top">
        <h1>Teacher Monthly Workload</h1>
        <div className="top-right">
          <span>
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </span>
          <FaBell className="notification-icon" />
          <div className="profile">KS</div>
        </div>
      </div>

      <div className="workload-content">
        <p className="workload-description">
          Teacher workload calculated from the saved weekly timetable.
        </p>

        <div className="workload-box">
          <div className="workload-table">
            <div className="workload-row workload-heading">
              <div>Teacher Name</div>
              <div>Weekly Lectures</div>
              <div>Monthly Lectures</div>
              <div>Load</div>
            </div>

            {teachers.length > 0 ? (
              teachers.map(teacher => {
                const percentage = Math.min(100, (teacher.monthly / maxLectures) * 100);
                return (
                  <div className="workload-row" key={teacher.name}>
                    <div className="teacher-info">
                      <div
                        className="teacher-circle"
                        style={{ backgroundColor: teacher.color }}
                      >
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{teacher.name}</span>
                    </div>
                    <div>{teacher.weekly}</div>
                    <div>{teacher.monthly}</div>
                    <div className="load-container">
                      <div className="load-background">
                        <div
                          className="load-progress"
                          style={{ width: `${percentage}%`, backgroundColor: teacher.color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "20px" }}>
                No assigned lectures found. Please save lectures in the Timetable page first.
              </div>
            )}
          </div>
        </div>

        <p style={{ color: "#666", marginTop: "12px" }}>
          Monthly count is estimated from the recurring weekly timetable
          and the number of each weekday in this month. Holidays are not excluded.
        </p>
      </div>
    </div>
  );
}