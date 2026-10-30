import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Row, Col, } from "react-bootstrap";
import { FaPlus, FaDoorOpen, FaEdit, FaTrash, } from "react-icons/fa";
import "./Rooms.css";
export function Rooms() {
  const [show, setShow] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/rooms", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(r => r.json())
      .then(json => { setRooms(json.data); setLoading(false); })
      .catch(() => { setError("Rooms load nahi hue"); setLoading(false); });
  }, []);
  const [roomData, setRoomData] = useState({
    name: "",
    capacity: "",
  });

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ roomNumber: `R${Date.now()}`, name: roomData.name, capacity: Number(roomData.capacity), type: "classroom" })
      });
      const json = await res.json();
      setRooms(prev => [...prev, json.data]);
      setRoomData({ name: "", capacity: "" });
      setShow(false);
    } catch (err) {
      setError("Room save nahi hua");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    await fetch(`http://localhost:5000/api/rooms/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setRooms(prev => prev.filter(room => room._id !== id));
  };


  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <div>
          <h2>Manage Rooms</h2>
        </div>
        <div className="rooms-header-right">
          <span>
            September 23, 2026
          </span>
          <span className="notification">
            🔔
          </span>
          <div className="profile">
            KS
          </div>
        </div>
      </div>
      <div className="rooms-card">
        <div className="rooms-card-header">
          <div>
            <h3>Manage Rooms</h3>
            <p>
              Add or edit rooms available for lectures
            </p>
          </div>
          <Button className="add-room-btn" onClick={() => setShow(true)}>
            <FaPlus />
            Add Room
          </Button>
        </div>
        <div className="room-grid">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            rooms.map((room) => (
              <div className="room-box" key={room._id}>
                <FaDoorOpen className="room-icon" />
                <h4>{room.name || room.roomNumber}</h4>
                <p>Capacity: {room.capacity}</p>
                <div className="room-actions">
                  <button className="edit-room">
                    <FaEdit />
                  </button>
                  <button
                    className="delete-room"
                    onClick={() => handleDelete(room._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <Modal
          show={show}
          onHide={() => setShow(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Add Room
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddRoom}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>
                  Room Name
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter room name"
                  value={roomData.name}
                  onChange={(e) =>
                    setRoomData({
                      ...roomData,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>
                  Capacity
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter capacity"
                  value={roomData.capacity}
                  onChange={(e) =>
                    setRoomData({
                      ...roomData,
                      capacity: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShow(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="save-room"
              >
                Add Room
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
       </div>
      )
}