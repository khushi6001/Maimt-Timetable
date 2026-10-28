import { Container, Row, Col, Form, Image, Button, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logos.png";
import college from "../../assets/college.jpg";
import { useFormik } from "formik";
import { useEffect } from "react";
import * as yup from "yup";
import { FaUser, FaLock, FaGraduationCap } from "react-icons/fa";
import "./Login.css";
export function Login() {
  const navigate = useNavigate();
  const initialValues = {
    email: "",
    password: ""
  };
  const formik = useFormik({
    initialValues,
    validationSchema: yup.object({
      email: yup.string().email("Invalid email").required("Please enter your email"),
      password: yup.string().required("Please enter your password").max(8, "Password cannot be greater than 8 characters")
    }),
    onSubmit: async (values) => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: values.email,
              password: values.password,
              role: "admin"
            })

          }
        );
        const data = await response.json();
        if (!response.ok) {
          alert(data.message || "Login failed");
          return;
        }
        localStorage.setItem("data", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        navigate("/Dashboard");
      } catch (error) {
        console.error("Login error:", error);
        alert("Cannot connect to the server. Please try again.");
      }
    }
  })
  return (
    <Container fluid className="login-page">
      <Row className="login-row">
        <Col md={6} className="left-col">
          <div
            className="left-background"
            style={{ backgroundImage: `   linear-gradient(     rgba(0, 103, 79, 0.80),     rgba(0, 103, 79, 0.80)  ), url(${college}) ` }} >
            <div className="college-content">
              <div className="cap-icon"><FaGraduationCap /></div>
              <Image src={logo} className="college-logo" />
              <div className="college-info">
                <h2>MAHARAJA AGRASEN</h2>
                <h3>
                  INSTITUTE OF MANAGEMENT AND TECHNOLOGY
                </h3>
                <p className="system-name">
                  TIMETABLE MANAGEMENT SYSTEM
                </p>
              </div>
              <p className="tagline">
                "Better Planning for a Brighter Future"
              </p>
            </div>
          </div>
        </Col>
        <Col md={6} className="right-col">
          <div className="login-content">
            <h1>Login to Your Account</h1>
            <p className="subtitle">
              Access your timetable and manage your classes
            </p>
            {/* <div className="role-buttons">

              <Button
                className={login ? "role active" : "role"}
                onClick={() => setlogin(true)}
              >
                Admin
              </Button>

              <Button
                className={!login ? "role active" : "role"}
                onClick={() => setlogin(false)}
              >
                Teacher
              </Button>

            </div> */}
                <Form onSubmit={formik.handleSubmit}>
                  <Form.Group className="form-group">
                    <Form.Label>  Admin Email</Form.Label>
                    <InputGroup className="custom-input">
                      <InputGroup.Text> <FaUser /></InputGroup.Text>
                      <Form.Control type="email" placeholder="Enter admin Email"{...formik.getFieldProps("email")} /></InputGroup>
                    {formik.touched.email &&
                      formik.errors.email && (
                        <span className="error">
                          {formik.errors.email}
                        </span>
                      )}
                  </Form.Group>
                  <Form.Group className="form-group">
                    <Form.Label> Password </Form.Label>
                    <InputGroup className="custom-input">
                      <InputGroup.Text>
                        <FaLock />
                      </InputGroup.Text>
                      <Form.Control
                        type="password"
                        placeholder="Enter password"
                        {...formik.getFieldProps("password")}
                      />
                    </InputGroup>
                    {formik.touched.password &&
                      formik.errors.password && (
                        <span className="error">
                          {formik.errors.password}
                        </span>
                      )}
                  </Form.Group>
                  <Button
                    type="submit"
                    className="login-button"
                  >
                    Login
                  </Button>
                  <p className="forgot">
                    <a href="#">
                    </a>
                  </p>
                  <p className="copyright">
                    © 2026 MAIMT. All rights reserved.
                  </p>
                </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}