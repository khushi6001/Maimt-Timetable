import { useState } from "react";
import {Container,Row, Col, Card, Form, Button, Alert} from "react-bootstrap";
import {FaUser,FaEnvelope,FaPhone,FaGraduationCap,FaEdit,FaSave,FaBell} from "react-icons/fa";
import "./Profile.css";
const STORAGE_KEY = "userProfile";
const defaultProfile = {
  name: "Khushi Sharma",
  email: "",
  phone: "",
  role: "Admin",
  department: "Computer Applications",
  college: "MAIMT"
};
export default function Profile() {
  const [profile, setProfile] = useState(() => {
    try {
      return {
        ...defaultProfile,
        ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
      };
    } catch {
      return defaultProfile;
    }
  });
  const [formData, setFormData] = useState({ ...profile });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleEdit = () => {
    setFormData({ ...profile });
    setMessage("");
    setIsEditing(true);
  };
  const handleSave = (e) => {
    e.preventDefault();
    const updatedProfile = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim()
    };
    setProfile(updatedProfile);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedProfile)
    );
    setIsEditing(false);
    setMessage("Profile updated successfully!");
  };
  const handleCancel = () => {
    setFormData({ ...profile });
    setIsEditing(false);
    setMessage("");
  };
  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
  return (
    <div className="profile-page">
      <div className="profile-topbar">
        <div>
          <span className="profile-brand">MAIMT</span>
          <span className="profile-brand-subtitle">
            Timetable Management System
          </span>
        </div>
        <div className="profile-top-right">
          <FaBell />
          <span className="profile-mini-avatar">{initials}</span>
        </div>
      </div>
      <Container fluid className="profile-content">
        <div className="profile-heading">
          <div>
            <h2>My Profile</h2>
            <p>Manage your personal information</p>
          </div>
        </div>
        {message && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setMessage("")}
          >
            {message}
          </Alert>
        )}
        <Row className="g-4">
          <Col lg={4}>
            <Card className="profile-card profile-summary">
              <Card.Body>
                <div className="profile-avatar">{initials}</div>
                <h4>{profile.name}</h4>
                <p className="profile-role">{profile.role}</p>
                <div className="profile-divider" />
                <div className="profile-summary-item">
                  <FaGraduationCap />
                  <span>{profile.college}</span>
                </div>
                <div className="profile-summary-item">
                  <FaUser />
                  <span>{profile.department}</span>
                </div>
                <div className="profile-summary-item">
                  <FaEnvelope />
                  <span className="profile-email">
                    {profile.email || "Email not added"}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={8}>
            <Card className="profile-card">
              <Card.Body>
                <div className="profile-form-heading">
                  <div>
                    <h4>Personal Information</h4>
                  </div>
                  {!isEditing && (
                    <Button
                      className="profile-edit-btn"
                      onClick={handleEdit}
                    >
                      <FaEdit className="me-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
                <Form onSubmit={handleSave}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Full Name</Form.Label>
                        <div className="profile-input-wrap">
                          <FaUser />
                          <Form.Control
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                            maxLength={80}
                            placeholder="Enter full name"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email Address</Form.Label>
                        <div className="profile-input-wrap">
                          <FaEnvelope />
                          <Form.Control
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="Enter email"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Phone Number</Form.Label>
                        <div className="profile-input-wrap">
                          <FaPhone />
                          <Form.Control
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            maxLength={10}
                            pattern="[0-9]{10}"
                            title="Enter a 10-digit phone number"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Role</Form.Label>
                        <Form.Select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          disabled={!isEditing}
                        >
                          <option value="Developer">Developer</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Department</Form.Label>
                        <Form.Control
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>College</Form.Label>
                        <Form.Control
                          name="college"
                          value={formData.college}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  {isEditing && (
                    <div className="profile-actions">
                      {/* <Button
                        variant="secondary"
                        type="button"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button> */}

                      {/* <Button
                        type="submit"
                        className="profile-save-btn"
                      >
                        <FaSave className="me-2" />
                        Save Changes
                      </Button> */}
                    </div>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="profile-footer">
          MAIMT Timetable Management System
        </div>
      </Container>
    </div>
  );
}