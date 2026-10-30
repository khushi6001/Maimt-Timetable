import { useEffect, useMemo, useRef, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Alert, Modal } from "react-bootstrap";
import { FaCalendarAlt, FaPlus, FaTrash, FaSave, FaEdit, FaTimes, FaWhatsapp, FaDownload, FaCopy } from "react-icons/fa";
import html2canvas from "html2canvas";

const API = "http://localhost:5000/api/simple-timetable";
const getToken = () => localStorage.getItem("token");

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const TIME_SLOTS = ["09:00-09:50","09:50-10:40","11:00-11:50","11:50-12:40","12:40-01:30","01:30-02:20","02:20-03:10","03:10-04:00"];

const createEmptySlots = () =>
  Object.fromEntries(TIME_SLOTS.map((time) => [time, { type: "lecture", subject: "", teacher: "" }]));

const getCurrentMonday = () => {
  const date = new Date();
  const day = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  return date.toISOString().split("T")[0];
};

const slotLabel = (slot) => {
  if (slot?.type === "lunch") return "Lunch Break";
  if (slot?.type === "free") return "Free Slot";
  return slot?.subject?.trim() || "";
};

const normalizeSlots = (slots = {}) => {
  const defaults = createEmptySlots();
  TIME_SLOTS.forEach((time) => {
    const s = slots[time] || {};
    defaults[time] = { type: s.type || "lecture", subject: s.subject || "", teacher: s.teacher || "" };
  });
  return defaults;
};

const apiFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...options.headers },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
};

const loadFromBackend = async (academicYear) => {
  const json = await apiFetch(`${API}?academicYear=${academicYear}`);
  return json.data;
};
const saveToBackend = async (row) => {
  const json = await apiFetch(API, { method: "POST", body: JSON.stringify(row) });
  return json.data;
};
const updateInBackend = async (id, row) => {
  const json = await apiFetch(`${API}/${id}`, { method: "PUT", body: JSON.stringify(row) });
  return json.data;
};
const deleteFromBackend = async (id) => {
  await apiFetch(`${API}/${id}`, { method: "DELETE" });
};
const deleteDayFromBackend = async (day, academicYear) => {
  await apiFetch(`${API}?day=${day}&academicYear=${academicYear}`, { method: "DELETE" });
};

export function Timetable() {
  const [weekStart, setWeekStart] = useState(getCurrentMonday);
  const [viewDay, setViewDay] = useState("Monday");
  const [formData, setFormData] = useState({
    className: "BCA 1 Year", section: "A", academicYear: "2026-27",
    day: "Monday", room: "", slots: createEmptySlots(),
  });
  const [timetable, setTimetable] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTeacher, setSearchTeacher] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await loadFromBackend(formData.academicYear);
        setTimetable(data);
      } catch (err) {
        setError("Backend se data load nahi hua: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [formData.academicYear]);

  const getTeacherNames = (value = "") =>
    value.split("/").map((n) => n.trim().toLowerCase()).filter(Boolean);

  const hasLectureOrBreak = () =>
    TIME_SLOTS.some((time) => {
      const slot = formData.slots[time];
      return slot?.type === "free" || slot?.type === "lunch" || Boolean(slot?.subject?.trim());
    });

  const checkClassConflict = () =>
    timetable.some((row) =>
      row.id !== editingId && row.day === formData.day &&
      row.className === formData.className && row.section === formData.section
    );

  const checkTeacherConflict = () => {
    for (const time of TIME_SLOTS) {
      const cur = formData.slots[time];
      if (cur?.type !== "lecture") continue;
      const curTeachers = getTeacherNames(cur.teacher);
      if (!curTeachers.length) continue;
      const conflict = timetable.some((row) => {
        if (row.id === editingId || row.day !== formData.day) return false;
        const other = row.slots?.[time];
        if (other?.type && other.type !== "lecture") return false;
        return curTeachers.some((t) => getTeacherNames(other?.teacher).includes(t));
      });
      if (conflict) return time;
    }
    return null;
  };

  const checkRoomConflict = () => {
    if (!formData.room.trim()) return null;
    for (const time of TIME_SLOTS) {
      const cur = formData.slots[time];
      if (cur?.type !== "lecture" || !cur?.subject?.trim()) continue;
      const conflict = timetable.some((row) => {
        if (row.id === editingId || row.day !== formData.day) return false;
        if ((row.room || "").trim().toLowerCase() !== formData.room.trim().toLowerCase()) return false;
        const other = row.slots?.[time];
        return (!other?.type || other.type === "lecture") && Boolean(other?.subject?.trim());
      });
      if (conflict) return time;
    }
    return null;
  };

  const getTeacherDailyCount = (teacherName, day, ignoreId = null) => {
    const name = teacherName.trim().toLowerCase();
    let count = 0;
    timetable.forEach((row) => {
      if (row.id === ignoreId || row.day !== day) return;
      TIME_SLOTS.forEach((time) => {
        const slot = row.slots?.[time];
        if (slot?.type && slot.type !== "lecture") return;
        if (getTeacherNames(slot?.teacher).includes(name) && slot?.subject?.trim()) count++;
      });
    });
    return count;
  };

  const saveClassTimetable = async (event) => {
    event.preventDefault();
    setError(""); setSuccess("");
    if (!formData.room.trim()) { setError("Please enter Room / Lab number."); return; }
    if (!hasLectureOrBreak()) { setError("Please add at least one lecture, lunch or free slot."); return; }
    if (checkClassConflict()) { setError(`${formData.className} Section ${formData.section} already has a timetable for ${formData.day}.`); return; }
    const roomConflict = checkRoomConflict();
    if (roomConflict) { setError(`Room ${formData.room} is already occupied on ${formData.day} at ${roomConflict}.`); return; }
    const teacherConflict = checkTeacherConflict();
    if (teacherConflict) { setError(`Teacher conflict on ${formData.day} at ${teacherConflict}.`); return; }

    const teachersUsed = new Set();
    TIME_SLOTS.forEach((time) => {
      const slot = formData.slots[time];
      if (slot?.type !== "lecture") return;
      getTeacherNames(slot?.teacher).forEach((t) => teachersUsed.add(t));
    });
    for (const teacher of teachersUsed) {
      let newCount = 0;
      TIME_SLOTS.forEach((time) => {
        const slot = formData.slots[time];
        if ((!slot?.type || slot.type === "lecture") && slot?.subject?.trim() && getTeacherNames(slot?.teacher).includes(teacher)) newCount++;
      });
      if (getTeacherDailyCount(teacher, formData.day, editingId) + newCount > 7) {
        setError(`${teacher.toUpperCase()} cannot have more than 7 lectures on ${formData.day}.`); return;
      }
    }

    const payload = {
      className: formData.className, section: formData.section,
      academicYear: formData.academicYear, day: formData.day,
      room: formData.room.trim(), slots: normalizeSlots(formData.slots),
    };

    try {
      let saved;
      if (editingId !== null) {
        saved = await updateInBackend(editingId, payload);
        setTimetable((prev) => prev.map((row) => row.id === editingId ? saved : row));
        setSuccess("Timetable updated successfully.");
      } else {
        saved = await saveToBackend(payload);
        setTimetable((prev) => [...prev, saved]);
        setSuccess(`${formData.className} Section ${formData.section} timetable saved.`);
      }
      setEditingId(null);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () =>
    setFormData({ className: "BCA 1 Year", section: "A", academicYear: "2026-27", day: viewDay, room: "", slots: createEmptySlots() });

  const editClass = (row) => {
    setFormData({ className: row.className, section: row.section, academicYear: row.academicYear || "2026-27", day: row.day, room: row.room || "", slots: normalizeSlots(row.slots) });
    setEditingId(row.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => { setEditingId(null); resetForm(); setError(""); setSuccess("Edit cancelled."); };
  const askDelete = (id) => { setDeleteId(id); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteFromBackend(deleteId);
      setTimetable((prev) => prev.filter((row) => row.id !== deleteId));
      if (editingId === deleteId) { setEditingId(null); resetForm(); }
      setSuccess("Timetable deleted successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setShowDeleteModal(false); setDeleteId(null);
    }
  };

  const confirmDeleteDay = async () => {
    try {
      await deleteDayFromBackend(viewDay, formData.academicYear);
      setTimetable((prev) => prev.filter((row) => row.day !== viewDay));
      if (editingId !== null) { setEditingId(null); resetForm(); }
      setSuccess(`All timetables for ${viewDay} deleted.`);
    } catch (err) { setError(err.message); }
  };

  const saveCompleteWeek = () => {
    if (timetable.length === 0) { setError("Please create at least one timetable first."); return; }
    setSuccess("All timetables are already saved to the database!");
  };

  const getDateForDay = (dayName) => {
    if (!weekStart) return null;
    const date = new Date(`${weekStart}T00:00:00`);
    date.setDate(date.getDate() + DAYS.indexOf(dayName));
    return date;
  };
  const formatDate = (date) =>
    date ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
  const selectedDate = getDateForDay(viewDay);

  const dayRows = useMemo(() => timetable.filter((row) => row.day === viewDay), [timetable, viewDay]);
  const sortedRows = useMemo(() => [...dayRows].sort((a, b) => a.className.localeCompare(b.className) || a.section.localeCompare(b.section)), [dayRows]);
  const visibleRows = sortedRows.filter((row) => {
    if (!searchTeacher.trim()) return true;
    return TIME_SLOTS.some((time) => getTeacherNames(row.slots?.[time]?.teacher).some((n) => n.includes(searchTeacher.trim().toLowerCase())));
  });
  const teachers = useMemo(() => {
    const names = new Set();
    timetable.forEach((row) => TIME_SLOTS.forEach((time) => {
      const slot = row.slots?.[time];
      if (slot?.type && slot.type !== "lecture") return;
      getTeacherNames(slot?.teacher).forEach((n) => names.add(n));
    }));
    return [...names];
  }, [timetable]);
  const totalLectures = timetable.reduce((total, row) =>
    total + TIME_SLOTS.filter((time) => { const s = row.slots?.[time]; return (!s?.type || s.type === "lecture") && Boolean(s?.subject?.trim()); }).length, 0);

  const generateTimetableImage = async () => {
    if (!tableRef.current) { setError("Table not found."); return null; }
    try {
      const canvas = await html2canvas(tableRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      return canvas.toDataURL("image/png");
    } catch { setError("Unable to generate image."); return null; }
  };
  const downloadTimetableImage = async () => {
    const image = await generateTimetableImage(); if (!image) return;
    const link = document.createElement("a"); link.href = image; link.download = `${viewDay}-Timetable.png`; link.click();
    setSuccess(`${viewDay} timetable downloaded.`);
  };
  const copyTimetableText = async () => {
    let text = `Maharaja Agrasen Institute of Management and Technology, Jagadhri\n${formatDate(selectedDate)} - ${viewDay}\n\n`;
    visibleRows.forEach((row) => {
      text += `${row.className} Section ${row.section} | Room ${row.room}\n`;
      TIME_SLOTS.forEach((time) => {
        const slot = row.slots?.[time]; const label = slotLabel(slot);
        if (label) { text += `${time} - ${label}`; if ((!slot?.type || slot.type === "lecture") && slot?.teacher) text += ` (${slot.teacher})`; text += "\n"; }
      });
      text += "\n";
    });
    try { await navigator.clipboard.writeText(text); setSuccess("Timetable copied."); }
    catch { setError("Unable to copy."); }
  };
  const shareOnWhatsApp = async () => {
    const image = await generateTimetableImage(); if (!image) return;
    const message = `MAIMT Timetable - ${viewDay} (${formatDate(selectedDate)})`;
    try {
      const blob = await (await fetch(image)).blob();
      const file = new File([blob], `${viewDay}-Timetable.png`, { type: "image/png" });
      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: `${viewDay} Timetable`, text: message }); return; }
      const link = document.createElement("a"); link.href = image; link.download = `${viewDay}-Timetable.png`; document.body.appendChild(link); link.click(); link.remove();
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      setSuccess("Image downloaded. Attach in WhatsApp.");
    } catch (err) { if (err.name === "AbortError") return; setError("Unable to share."); }
  };

  const cardStyle       = { borderRadius: "8px", border: "1px solid #ddd", marginBottom: "18px" };
  const titleStyle      = { fontWeight: "700", color: "#004c42" };
  const inputLabelStyle = { fontWeight: "600", marginBottom: "6px" };
  const thStyle         = { border: "1px solid #000", padding: "7px", textAlign: "center", verticalAlign: "middle", fontWeight: "700", background: "#fff", color: "#000", whiteSpace: "nowrap" };
  const tdStyle         = { border: "1px solid #000", padding: "6px", textAlign: "center", verticalAlign: "middle", color: "#000", background: "#fff" };

  if (loading) return <Container fluid style={{ padding: 20 }}><p>Loading timetable from server...</p></Container>;

  return (
    <Container fluid style={{ padding: "20px", background: "#f7f9f8", minHeight: "100vh" }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <div>
          <h2 style={titleStyle}><FaCalendarAlt /> {editingId !== null ? "Edit Class Timetable" : "Create Weekly Timetable"}</h2>
          <p className="mb-0">Create, save and share the class timetable.</p>
        </div>
        <Button variant="success" onClick={saveCompleteWeek}><FaSave /> Save Complete Week</Button>
        <Button variant="danger" onClick={confirmDeleteDay}><FaTrash /> Delete All {viewDay}</Button>
      </div>

      {error   && <Alert variant="danger"  dismissible onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>}

      <Card style={cardStyle}><Card.Body>
        <h5 style={titleStyle}>Weekly Timetable Settings</h5>
        <Row className="g-3 mt-1">
          <Col md={4}><Form.Label style={inputLabelStyle}>Week Starting Date</Form.Label><Form.Control type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} /></Col>
          <Col md={4}><Form.Label style={inputLabelStyle}>Selected Day</Form.Label><Form.Control readOnly value={`${viewDay} - ${formatDate(selectedDate)}`} /></Col>
          <Col md={4}><div className="p-3 border rounded h-100 d-flex justify-content-between align-items-center"><strong>Total Lectures</strong><strong style={{ fontSize: "25px", color: "#00674f" }}>{totalLectures}</strong></div></Col>
        </Row>
      </Card.Body></Card>

      <Card style={cardStyle}><Card.Body>
        <h5 style={titleStyle}>Select Day</h5>
        <div className="d-flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <Button key={day} variant={viewDay === day ? "success" : "outline-success"}
              onClick={() => { setViewDay(day); setFormData((p) => ({ ...p, day })); }}>{day}</Button>
          ))}
        </div>
      </Card.Body></Card>

      <Card style={cardStyle}><Card.Body>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h5 style={titleStyle}>{editingId !== null ? "Edit Class Timetable" : "Add Class Timetable"}</h5>
          {editingId !== null && <Button variant="outline-secondary" onClick={cancelEdit}><FaTimes /> Cancel Edit</Button>}
        </div>
        <Form onSubmit={saveClassTimetable}>
          <Row className="g-3 mb-4">
            <Col md={3}><Form.Label style={inputLabelStyle}>Class / Year</Form.Label>
              <Form.Select name="className" value={formData.className} onChange={(e) => setFormData((p) => ({ ...p, className: e.target.value }))}>
                <option>BCA 1 Year</option><option>BCA 2 Year</option><option>BCA 3 Year</option><option>MCA 1 Year</option><option>MCA 2 Year</option>
              </Form.Select></Col>
            <Col md={2}><Form.Label style={inputLabelStyle}>Section</Form.Label>
              <Form.Select name="section" value={formData.section} onChange={(e) => setFormData((p) => ({ ...p, section: e.target.value }))}>
                <option>A</option><option>B</option><option>C</option><option>D</option>
              </Form.Select></Col>
            <Col md={2}><Form.Label style={inputLabelStyle}>Day</Form.Label>
              <Form.Select name="day" value={formData.day} onChange={(e) => setFormData((p) => ({ ...p, day: e.target.value }))}>
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </Form.Select></Col>
            <Col md={2}><Form.Label style={inputLabelStyle}>Room No.</Form.Label>
              <Form.Control name="room" value={formData.room} onChange={(e) => setFormData((p) => ({ ...p, room: e.target.value }))} placeholder="Enter room" required /></Col>
            <Col md={3}><Form.Label style={inputLabelStyle}>Academic Year</Form.Label>
              <Form.Select name="academicYear" value={formData.academicYear} onChange={(e) => setFormData((p) => ({ ...p, academicYear: e.target.value }))}>
                <option>2026-27</option><option>2027-28</option><option>2028-29</option>
              </Form.Select></Col>
          </Row>

          <h5 style={titleStyle}>Enter Lectures and Breaks</h5>
          <p>Select the slot type for each time. Subject and teacher are needed only for lectures.</p>

          {TIME_SLOTS.map((time) => {
            const slot = formData.slots[time] || { type: "lecture", subject: "", teacher: "" };
            const isLecture = slot.type === "lecture";
            return (
              <Card key={time} className="mb-3"><Card.Body>
                <Row className="g-3 align-items-end">
                  <Col md={3}><Form.Label style={inputLabelStyle}>Time</Form.Label><Form.Control value={time} readOnly /></Col>
                  <Col md={3}><Form.Label style={inputLabelStyle}>Slot Type</Form.Label>
                    <Form.Select value={slot.type || "lecture"} onChange={(e) => setFormData((p) => ({ ...p, slots: { ...p.slots, [time]: { ...p.slots[time], type: e.target.value, ...(e.target.value !== "lecture" ? { subject: "", teacher: "" } : {}) } } }))}>
                      <option value="lecture">Lecture</option>
                      <option value="lunch">Lunch Break</option>
                      <option value="free">Free Slot</option>
                    </Form.Select></Col>
                  {isLecture ? (
                    <>
                      <Col md={3}><Form.Label style={inputLabelStyle}>Subject</Form.Label>
                        <Form.Control placeholder="Subject" value={slot.subject || ""} onChange={(e) => setFormData((p) => ({ ...p, slots: { ...p.slots, [time]: { ...p.slots[time], subject: e.target.value } } }))} /></Col>
                      <Col md={3}><Form.Label style={inputLabelStyle}>Teacher</Form.Label>
                        <Form.Control placeholder="Teacher" value={slot.teacher || ""} onChange={(e) => setFormData((p) => ({ ...p, slots: { ...p.slots, [time]: { ...p.slots[time], teacher: e.target.value } } }))} /></Col>
                    </>
                  ) : (
                    <Col md={6}><Form.Control value={slotLabel(slot)} readOnly /></Col>
                  )}
                </Row>
              </Card.Body></Card>
            );
          })}

          <div className="d-flex justify-content-end flex-wrap gap-2">
            {editingId !== null && <Button variant="outline-secondary" onClick={cancelEdit} type="button"><FaTimes /> Cancel</Button>}
            <Button variant="success" type="submit">{editingId !== null ? <><FaSave /> Update Class</> : <><FaPlus /> Save Class</>}</Button>
          </div>
        </Form>
      </Card.Body></Card>

      <Card style={cardStyle}><Card.Body>
        <Row className="g-3 align-items-end">
          <Col md={5}><Form.Label style={inputLabelStyle}>Search Teacher</Form.Label><Form.Control placeholder="Enter teacher name" value={searchTeacher} onChange={(e) => setSearchTeacher(e.target.value)} /></Col>
          <Col md={7}><div className="d-flex flex-wrap gap-2">
            <Button variant="outline-dark" onClick={copyTimetableText}><FaCopy /> Copy</Button>
            <Button variant="outline-dark" onClick={downloadTimetableImage}><FaDownload /> Download Image</Button>
            <Button variant="success" onClick={shareOnWhatsApp}><FaWhatsapp /> Share on WhatsApp</Button>
          </div></Col>
        </Row>
      </Card.Body></Card>

      <Card style={{ ...cardStyle, overflowX: "auto" }}><Card.Body>
        <div ref={tableRef} style={{ background: "#fff", padding: "10px", color: "#000", minWidth: "1200px" }}>
          <div style={{ border: "1px solid #000", textAlign: "center", fontWeight: "700", fontSize: "20px", padding: "8px" }}>Maharaja Agrasen Institute of Management and Technology, Jagadhri</div>
          <div style={{ border: "1px solid #000", borderTop: "none", textAlign: "center", fontWeight: "700", fontSize: "18px", padding: "8px" }}>{formatDate(selectedDate)} — {viewDay}</div>
          <Table bordered className="mb-0" style={{ borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={thStyle}>Class / Section</th>
              <th style={thStyle}>Room No.</th>
              {TIME_SLOTS.map((time) => <th key={time} style={thStyle}>{time}</th>)}
            </tr></thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr><td colSpan={TIME_SLOTS.length + 2} style={{ ...tdStyle, padding: "35px" }}>No timetable created for {viewDay}.</td></tr>
              ) : visibleRows.map((row) => (
                <tr key={row.id}>
                  <td style={tdStyle}><strong>{row.className}</strong><br />Section {row.section}<br /></td>
                  <td style={tdStyle}>{row.room}</td>
                  {TIME_SLOTS.map((time) => {
                    const slot = row.slots?.[time] || {};
                    const label = slotLabel(slot);
                    const isLecture = !slot.type || slot.type === "lecture";
                    const highlighted = searchTeacher.trim() && getTeacherNames(slot.teacher).some((n) => n.includes(searchTeacher.trim().toLowerCase()));
                    return (
                      <td key={time} style={{ ...tdStyle, background: highlighted ? "#fff3cd" : "#fff" }}>
                        {label ? (<><strong>{label}</strong>{isLecture && slot.teacher && <><br /><small>{slot.teacher}</small></>}</>) : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body></Card>

      <Card style={cardStyle}><Card.Body>
        <h5 style={titleStyle}>{viewDay} Classes</h5>
        {visibleRows.length === 0 ? <p>No class timetable added for {viewDay}.</p> : visibleRows.map((row) => (
          <div key={row.id} className="d-flex justify-content-between align-items-center flex-wrap gap-2 p-3 mb-2" style={{ border: "1px solid #ddd", borderRadius: "8px", background: "#fff" }}>
            <div><strong>{row.className} — Section {row.section}</strong></div>
            <div className="d-flex gap-2">
              <Button size="sm" variant="outline-success" onClick={() => editClass(row)}><FaEdit /> Edit</Button>
              <Button size="sm" variant="outline-danger" onClick={() => askDelete(row.id)}><FaTrash /> Delete</Button>
            </div>
          </div>
        ))}
      </Card.Body></Card>

      <Card style={cardStyle}><Card.Body>
        <h5 style={titleStyle}>Teacher Workload — {viewDay}</h5>
        <Row>
          {teachers.length === 0 ? <Col><p>No teacher assigned yet.</p></Col> : teachers.map((teacher) => {
            const count = getTeacherDailyCount(teacher, viewDay);
            return (
              <Col md={3} sm={6} key={teacher} className="mb-3">
                <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "12px", background: count >= 7 ? "#ffe5e5" : "#f4faf7" }}>
                  <strong>{teacher.toUpperCase()}</strong><br />{count} / 7 lectures
                </div>
              </Col>
            );
          })}
        </Row>
      </Card.Body></Card>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Timetable</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this class timetable?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}><FaTrash /> Delete</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Timetable;