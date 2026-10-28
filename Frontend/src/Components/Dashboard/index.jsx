import { Row, Col, Container, Image } from "react-bootstrap"
import { Link, Outlet } from "react-router-dom";
import { FaHome, } from "react-icons/fa";
import { FaChalkboardTeacher, FaCalendarAlt, FaChalkboard, FaDoorOpen, FaClock, FaTachometerAlt, FaCog, FaGraduationCap,FaLayerGroup } from "react-icons/fa";
import "./Dashboard.css";
export function Dashboard() {
    return (
        <>
            <Container fluid className="dashboard-container">
                <Row className="dashboard-row">
                    <Col
                        md={3} className="sidebar"
                    >
                        <div className="sidebar-header">
                            <FaGraduationCap className="cap-icon" />

                            <h4 id="name">MAIMT</h4>
                            <p className="define">Timetable System</p>

                        </div>
                       <nav className="sidebar-nav">
                         <Link className="link" to="/Dashboard"><FaHome />Dashboard</Link>
                        <Link className="link" to="/Dashboard/Timetable"><FaCalendarAlt />Timetable</Link>
                        <Link className="link" to="/Dashboard/Teacher"><FaChalkboardTeacher />Teacher</Link>
                        <Link className="link" to="/Dashboard/Classes"><FaChalkboard />Classes</Link>
                        <Link className="link" to="/Dashboard/Rooms"><FaDoorOpen />Rooms</Link>
                        {/* <Link className="link" to="/Dashboard/Freeslot"><FaClock />Freeslot</Link> */}
                        <Link className="link" to="/Dashboard/workload"><FaTachometerAlt />Teachers Workload</Link>
                         <Link className="link" to="/Dashboard/Profile"><FaLayerGroup />Profile</Link>
                       </nav>
                </Col>
                <Col md={9} className="main-content">
                    <Outlet />
                </Col>
            </Row>
        </Container >

        </>
    )
}