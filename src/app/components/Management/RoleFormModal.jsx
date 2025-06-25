import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

function RoleFormModal({ show, mode, role, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: role?.name || "",
    description: role?.description || "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Role name is required");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(
        {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        },
        mode === "edit"
      );
    } catch (err) {
      setError("Failed to save role. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{mode === "add" ? "Add Role" : "Edit Role"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="roleName">
            <Form.Label>Role Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter role name"
              required
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="roleDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter role description (optional)"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting
              ? mode === "add"
                ? "Adding..."
                : "Updating..."
              : mode === "add"
              ? "Add Role"
              : "Update Role"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default RoleFormModal;
