import {Container,Row,Col,Form,Button, FormLabel, FormControl, FormSelect, Table} from "react-bootstrap";
import { useFormik } from "formik";
import { useState } from "react";
import * as yup from "yup";
import { FaTrash, FaEdit } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import "./Teacher.css";
export function Teacher() {
  const [edit, setedit] = useState(null);
  console.log(edit);
  const [formdata, setformdata] = useState(() => {
    return JSON.parse(localStorage.getItem("teachers")) || [];
  });
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

    onSubmit: (values) => {
      let updatedData;

      if (edit !== null) {
        // Update existing teacher
        updatedData = [...formdata];
        updatedData[edit] = values;
      } else {
        // Add new teacher
        updatedData = [...formdata, values];
      }

      setformdata(updatedData);

      localStorage.setItem(
        "teachers",
        JSON.stringify(updatedData)
      );

      setShow(false);
      setedit(null);
      formik.resetForm();
    }
  });

  const handleDelete = (index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (confirmDelete) {
      const updatedData = formdata.filter(
        (_, i) => i !== index
      );

      setformdata(updatedData);

      localStorage.setItem(
        "teachers",
        JSON.stringify(updatedData)
      );

      // If the edited teacher was deleted, close edit mode
      if (edit === index) {
        setShow(false);
        setedit(null);
        formik.resetForm();
      } else if (edit !== null && edit > index) {
        setedit(edit - 1);
      }
    }
  };

  const handleEdit = (index) => {
    setedit(index);

    // Fill form with selected teacher's data
    formik.setValues({
      name: formdata[index].name || "",
      email: formdata[index].email || "",
      subject: formdata[index].subject || "",
      contact: String(formdata[index].contact || "")
    });

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
              {formdata.map((data, index) => (
                <tr key={index}>
                  <td>T00{index + 1}</td>
                  <td>{data.name}</td>
                  <td>{data.email}</td>
                  <td>{data.subject}</td>
                  <td>{data.contact}</td>

                  <td>
                    <Button
                      type="button"
                      className="edit-btn me-2"
                      onClick={() => handleEdit(index)}
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      className="dust"
                      onClick={() => handleDelete(index)}
                    >
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
