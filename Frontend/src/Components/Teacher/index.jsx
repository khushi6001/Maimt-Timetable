import {Container,Row,Col,Form,Button, FormLabel, FormControl, FormSelect, Table} from "react-bootstrap";
import { useFormik } from "formik";
import { useState,useEffect } from "react";
import * as yup from "yup";
import { FaTrash, FaEdit } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import "./Teacher.css";
export function Teacher() {
  const [edit, setedit] = useState(null);
  console.log(edit);
  const [formdata, setformdata] = useState([]);
const [loading, setLoading]   = useState(true);
const [error, setError]       = useState("");

useEffect(() => {
  fetch("http://localhost:5000/api/teachers", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  })
    .then(r => r.json())
   .then(json => { 
  const list = Array.isArray(json.data) ? json.data : [];
  setformdata(list); 
  setLoading(false); 
})
    .catch(() => { setError("Teachers load nahi hue"); setLoading(false); });
}, []);
  console.log(formdata);

  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
    setedit(null);
    formik.resetForm();
  };

  const initialValues = {
    name: "",
    email: "",
    subject: "",
    contact: ""
  };

  const formik = useFormik({
    initialValues,

    validationSchema: yup.object({
      name: yup
        .string()
        .matches(/^[A-Za-z ]+$/, "Name cannot contain numbers")
        .required("Please enter your name"),

      email: yup
        .string()
        .email("Invalid email")
        .required("Please enter your email"),

      subject: yup
        .string()
        .required("Please select a subject"),

      contact: yup
        .string()
        .matches(/^[0-9]{10}$/, "Contact must be exactly 10 digits")
        .required("Please enter your contact number")
    }),
onSubmit: async (values) => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  try {
    if (edit !== null) {
      const res  = await fetch(`http://localhost:5000/api/teachers/${edit}`, {
        method: "PUT", headers, body: JSON.stringify({ name: values.name, email: values.email, department: values.subject, phone: values.contact })
      });
      const json = await res.json();
      setformdata(prev => prev.map(t => t._id === edit ? json.data : t));
    } else {
      const res  = await fetch("http://localhost:5000/api/teachers", {
        method: "POST", headers, body: JSON.stringify({ teacherId: `TCH${Date.now()}`, name: values.name, email: values.email, department: values.subject, phone: values.contact })
      });
      const json = await res.json();
      setformdata(prev => [...prev, json.data]);
    }
    setShow(false); setedit(null); formik.resetForm();
  } catch (err) {
    setError("Save nahi hua: " + err.message);
  }
}
  
  });

  const handleDelete = async (teacher) => {
  if (!window.confirm("Are you sure you want to delete this teacher?")) return;
  await fetch(`http://localhost:5000/api/teachers/${teacher._id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  setformdata(prev => prev.filter(t => t._id !== teacher._id));
};

   const handleEdit = (teacher) => {
  setedit(teacher._id);
  formik.setValues({ name: teacher.name || "", email: teacher.email || "", subject: teacher.department || "", contact: teacher.phone || "" });
  formik.setTouched({});
  setShow(true);
};

  const handleAdd = () => {
    setedit(null);
    formik.resetForm();
    setShow(true);
  };

  return (
    <Container className="teacher-container">
      <Row>
        <Col>
          <div className="teacher-header">
            <h3>Manage Teachers</h3>
            <p>Add, edit or remove teachers</p>

            <Button onClick={handleAdd}>
              Add Teacher
            </Button>
          </div>

          {/* Add / Edit Modal */}
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>
                {edit !== null ? "Edit Teacher" : "Add Teacher"}
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Form onSubmit={formik.handleSubmit}>
                <FormLabel>Name:</FormLabel>
                <FormControl
                  type="text"
                  {...formik.getFieldProps("name")}
                />
                <span style={{color:"red"}}>
                  {formik.touched.name && formik.errors.name}
                </span>
                <br />

                <FormLabel>Email:</FormLabel>
                <FormControl
                  type="email"
                  {...formik.getFieldProps("email")}
                />
                <span style={{color:"red"}}>
                  {formik.touched.email && formik.errors.email}
                </span>
                <br />

                <FormLabel>Subject:</FormLabel>
                <FormSelect {...formik.getFieldProps("subject")}>
                  <option value="">Select Subject</option>
                  <option value="Java">Java</option>
                  <option value="HTML">HTML</option>
                  <option value="Node">Node</option>
                  <option value="Data Science">Data Science</option>
                  <option value="DBMS">DBMS</option>
                  <option value="Web">Web</option>
                   <option value="SE">SE</option>
                  <option value="English">English</option>
                  <option value="ITR">ITR</option>
                  <option value="CPL">CPL</option>

                </FormSelect>
                <span style={{color:"red"}}>
                  {formik.touched.subject && formik.errors.subject}
                </span>
                <br />

                <FormLabel>Contact:</FormLabel>
                <FormControl
                  type="text"
                  maxLength={10}
                  {...formik.getFieldProps("contact")}
                />
                <span style={{color:"red"}}>
                  {formik.touched.contact && formik.errors.contact}
                </span>
                <br />

                <Button type="submit">
                  {edit !== null ? "Update Teacher" : "Add Teacher"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="ms-2"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Teachers Table */}
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Contact</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {formdata.filter(Boolean).map((data, index) => (
  <tr key={data?._id || index}>
  <td>{`T${String(index + 1).padStart(2, "0")}`}</td>
    <td>{data?.name}</td>
    <td>{data?.email}</td>
    <td>{data?.department}</td>
    <td>{data?.phone}</td>
    <td>
      <Button type="button" className="edit-btn me-2" onClick={() => handleEdit(data)}>
        <FaEdit />
      </Button>
      <Button type="button" variant="danger" className="dust" onClick={() => handleDelete(data)}>
        <FaTrash />
      </Button>
    </td>
  </tr>
))}
              {formdata.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">
                    No teachers found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}
