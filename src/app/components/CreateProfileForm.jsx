// components/CreateProfileForm.jsx
import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useAuth } from "../auth";
import { axiosInstance } from "./axiosInstance";
import { useNavigate } from "react-router-dom";

function CreateProfileForm({ show, onHide }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post("/register", {
        username,
        password,
        name,
        headerTitle: name,
        headerSubtitle: "Software Developer", // Default value
      });
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
      setError("");
      onHide();
      navigate("/"); // Redirect to homepage to display new profile
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          {error && <p className="text-danger">{error}</p>}
          <Button type="submit">Create Profile</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default CreateProfileForm;
