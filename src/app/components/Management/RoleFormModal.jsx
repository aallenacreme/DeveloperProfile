import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

export default function RoleFormModal({ show, mode, role, onClose, onSubmit }) {
  const isEdit = mode === "edit";
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (isEdit && role) {
      setFormData({
        name: role.name || "",
        description: role.description || "",
      });
    } else {
      setFormData({ name: "", description: "" });
    }
    setFormError(null); // Clear errors on modal open/change
  }, [isEdit, role, show]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formLoading) return;

    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Role name is required.");
      return;
    }

    setFormLoading(true);
    try {
      await onSubmit(
        {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        },
        isEdit
      );
      setFormData({ name: "", description: "" }); // Reset on success
      onClose();
    } catch (error) {
      setFormError(
        `Failed to ${isEdit ? "update" : "add"} role. Please try again.`
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Edit Role" : "Add New Role"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {formError && <Alert variant="danger">{formError}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="roleName">
            <Form.Label>Role Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
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
              onChange={handleFormChange}
              placeholder="Enter role description (optional)"
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button
              variant="secondary"
              onClick={onClose}
              className="me-2"
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={formLoading}>
              {formLoading
                ? isEdit
                  ? "Updating..."
                  : "Adding..."
                : isEdit
                ? "Update Role"
                : "Add Role"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
