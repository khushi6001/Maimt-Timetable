import { Button, Table, Modal, Form, Alert, Spinner } from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus, FaBell } from "react-icons/fa";
import "./classes.css";
import { useState, useEffect } from "react";
const STORAGE_KEY = "classes";
const emptyClass = {
  className: "",
  section: "",
  year: ""
};
export function Classes() {
  const [classes, setClasses] = useState(() => {
    try {
      const savedData = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
      if (!Array.isArray(savedData)) return [];
      return savedData.map((item) => ({
        ...item,
        id: item.id ?? crypto.randomUUID()
      }));
    } catch {
      return [];
    }
  });
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newClass, setNewClass] = useState(emptyClass);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(classes)
    );
  }, [classes]);
  const handleAddClick = () => {
    setEditId(null);
    setNewClass({ ...emptyClass });
    setError("");
    setShow(true);
  };
  const handleEdit = (item) => {
    setEditId(item.id);
    setNewClass({
      className: item.className || "",
      section: item.section || "",
      year: String(item.year || "")
    });
    setError("");
    setShow(true);
  };
  const handleSave = (e) => {
    e.preventDefault();
    setError("");
    const classData = {
      className: newClass.className.trim(),
      section: newClass.section,
      year: Number(newClass.year)
    };
    if (
      !classData.className ||
      !classData.section ||
      !newClass.year
    ) {
      setError("Please fill in all fields.");
      return;
    }
    setSaving(true);
    try {
      if (editId !== null) {
        const updatedClasses = classes.map((item) =>
          item.id === editId
            ? { ...item, ...classData }
            : item
        );
        setClasses(updatedClasses);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updatedClasses)
        );
      } else {
        const newRecord = {
          id: crypto.randomUUID(),
          ...classData
        };
        const updatedClasses = [...classes, newRecord];
        setClasses(updatedClasses);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updatedClasses)
        );
      }
      setShow(false);
      setEditId(null);
      setNewClass({ ...emptyClass });
    } catch (err) {
      setError("Unable to save class.");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this class?")) {
      return;
    }
    const updatedClasses = classes.filter(
      (item) => item.id !== id
    );
    setClasses(updatedClasses);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedClasses)
    );
    if (editId === id) {
      setShow(false);
      setEditId(null);
      setNewClass({ ...emptyClass });
    }
    setError("");
  };
  const handleClose = () => {
    if (saving) return;
    setShow(false);
    setEditId(null);
    setNewClass({ ...emptyClass });
    setError("");
  };
  return (
    <div className="classes-page">
      <div className="classes-content">
        <div className="top-header">
          <div className="header-right">
            <FaBell className="header-icon" />
            <div className="profile-circle">KS</div>
          </div>
        </div>
        <div className="page-heading">
          <h2>Manage Classes</h2>
        </div>
        <div className="classes-card">
          <div className="card-header-custom">
            <div>
              <h3>Manage Classes</h3>
              <p>Add, edit or delete classes</p>
            </div>
            <Button className="add-class-btn"onClick={handleAddClick}> <FaPlus /> Add Class</Button>
          </div>
          {error && (
            <Alert variant="danger" dismissibleonClose={() => setError("")}>  {error}</Alert> )}
          <div className="table-container">
            <Table responsive className="classes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Class Name</th>
                  <th>Section</th>
                  <th>Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center"><Spinner animation="border" size="sm" />{" "}Loading classes...</td>
                  </tr>
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center"> No classes found.</td>
                  </tr>
                ) : (
                  classes.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.className}</td>
                      <td>{item.section}</td>
                      <td>{item.year}</td>
                      <td>
                        <button type="button" className="action-btn edit-btn" title="Edit class" onClick={() => handleEdit(item)}>
                          <FaEdit />
                        </button>
                        <button  type="button" className="action-btn delete-btn" title="Delete class" onClick={() => handleDelete(item.id)}>   <FaTrash />  </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
      <Modal show={show} onHide={handleClose} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editId !== null ? "Edit Class" : "Add Class"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && (
              <Alert variant="danger">{error}</Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Class Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter class name"
                value={newClass.className}
                onChange={(e) =>
                  setNewClass((prev) => ({
                    ...prev,
                    className: e.target.value
                  }))
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Section</Form.Label>
              <Form.Select
                value={newClass.section}
                onChange={(e) =>
                  setNewClass((prev) => ({
                    ...prev,
                    section: e.target.value
                  }))
                }
                required
              >
                <option value="">Select Section</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Year</Form.Label>
              <Form.Select
                value={newClass.year}
                onChange={(e) =>
                  setNewClass((prev) => ({
                    ...prev,
                    year: e.target.value
                  }))
                }
                required
              >
                <option value="">Select Year</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              type="button"
              disabled={saving}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="save-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editId !== null
                  ? "Update Class"
                  : "Add Class"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}