import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

export default function DepartmentFormModal({
  show,
  mode,
  department,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === "edit";
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (isEdit && department) {
      setFormData({
        name: department.name || "",
        description: department.description || "",
      });
    } else {
      setFormData({ name: "", description: "" });
    }
    setFormError(null); // Reset error on modal open
  }, [isEdit, department, show]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formLoading) return; // Prevent multiple submissions
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Department name is required.");
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
      setFormData({ name: "", description: "" }); // Reset form after success
      onClose();
    } catch (error) {
      setFormError(
        `Failed to ${isEdit ? "update" : "add"} department: ${error.message}`
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? "Edit Department" : "Add New Department"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {formError && <Alert variant="danger">{formError}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="departmentName">
            <Form.Label>Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              id="departmentName"
              value={formData.name}
              onChange={handleFormChange}
              required
              placeholder="Enter department name"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="departmentDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              id="departmentDescription"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Enter department description"
              rows={3}
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
                ? "Update Department"
                : "Add Department"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
