import React, { useState } from "react";
import { Button,Modal,Form,Row,Col,} from "react-bootstrap";
import {FaPlus,FaDoorOpen,FaEdit,FaTrash,} from "react-icons/fa";
import "./Rooms.css";
export function Rooms() {
  const [show, setShow] = useState(false);
  const [rooms, setRooms] = useState([
    { id: "R001", name: "Room 21", capacity: 60 },
    { id: "R002", name: "Room 22", capacity: 60 },
    { id: "R003", name: "Room 23", capacity: 60 },
    { id: "R004", name: "Room 24", capacity: 60 },
    { id: "R005", name: "Room 25", capacity: 60 },
    { id: "R006", name: "Room 26", capacity: 60 },
    { id: "R007", name: "Room 27", capacity: 60 },
    { id: "R008", name: "Room 28", capacity: 60 },
  ]);
  const [roomData, setRoomData] = useState({
    name: "",
    capacity: "",
  });
  const handleAddRoom = (e) => {
    e.preventDefault();
    const newRoom = {
      id: `R00${rooms.length + 1}`,
      name: roomData.name,
      capacity: roomData.capacity,
    };
    setRooms([...rooms, newRoom]);
    setRoomData({
      name: "",
      capacity: "",
    });
    setShow(false);
  };
  const handleDelete = (id) => {
    setRooms(
      rooms.filter((room) => room.id !== id)
    );
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
          {rooms.map((room) => (
            <div
              className="room-box"
              key={room.id}
            >
              <FaDoorOpen className="room-icon" />
              <h4>
                {room.name}
              </h4>
              <p>
                Capacity: {room.capacity}
              </p>
              <div className="room-actions">
                <button className="edit-room">
                  <FaEdit />
                </button>
                <button
                  className="delete-room"
                  onClick={() =>
                    handleDelete(room.id)
                  }
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
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
  );
}