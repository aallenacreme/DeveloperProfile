import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

export default function TaskFormModal({
  show,
  mode,
  task,
  onClose,
  onSubmit,
  employees,
}) {
  const isEdit = mode === "edit";
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (isEdit && task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        assigned_to: task.assigned_to || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        assigned_to: "",
      });
    }
  }, [isEdit, task]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim() || !formData.assigned_to) {
      setFormError("Title and assigned employee are required.");
      return;
    }

    setFormLoading(true);

    try {
      await onSubmit(
        {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          assigned_to: formData.assigned_to,
        },
        isEdit
      );

      setFormError(null);
      onClose();
    } catch (_error) {
      setFormError(
        `Failed to ${isEdit ? "update" : "add"} task. Please try again.`
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Edit Task" : "Add New Task"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {formError && <Alert variant="danger">{formError}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formTitle">
            <Form.Label>Title *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              required
              placeholder="Enter task title"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Enter task description"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formAssignedTo">
            <Form.Label>Assign to Employee *</Form.Label>
            <Form.Select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleFormChange}
              required
            >
              <option value="">Select employee</option>
              {Object.entries(employees).map(([user_id, name]) => (
                <option key={user_id} value={user_id}>
                  {name}
                </option>
              ))}
            </Form.Select>
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
                ? "Update Task"
                : "Add Task"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
