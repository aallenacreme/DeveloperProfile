import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";

export default function EmployeeFormModal({
  show,
  mode,
  employee,
  onClose,
  onSubmit,
  roles,
  departments,
}) {
  const isEdit = mode === "edit";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role_id: "",
    department_id: "",
    age: "",
    salary: "",
    hire_date: "",
    status: "active",
    phone: "",
    address: "",
    skills: "",
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (isEdit && employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        role_id: employee.role_id || "",
        department_id: employee.department_id || "",
        age: employee.age ? employee.age.toString() : "",
        salary: employee.salary ? employee.salary.toString() : "",
        hire_date: employee.hire_date || "",
        status: employee.status || "active",
        phone: employee.phone || "",
        address: employee.address || "",
        skills: employee.skills?.length > 0 ? employee.skills.join(", ") : "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role_id: "",
        department_id: "",
        age: "",
        salary: "",
        hire_date: "",
        status: "active",
        phone: "",
        address: "",
        skills: "",
      });
    }
  }, [isEdit, employee]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.role_id ||
      !formData.department_id ||
      !formData.hire_date
    ) {
      setFormError(
        "Please fill in all required fields (Name, Email, Role, Department, Hire Date)."
      );
      return;
    }

    const ageNum = formData.age ? parseInt(formData.age, 10) : null;
    if (ageNum && (ageNum < 18 || ageNum > 120)) {
      setFormError("Age must be between 18 and 120.");
      return;
    }

    const salaryNum = formData.salary ? parseFloat(formData.salary) : null;
    if (salaryNum && salaryNum < 0) {
      setFormError("Salary must be a positive number.");
      return;
    }

    setFormLoading(true);

    try {
      const skillsArray =
        formData.skills.trim().length > 0
          ? formData.skills.split(",").map((s) => s.trim())
          : [];

      await onSubmit(
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role_id: formData.role_id,
          department_id: formData.department_id,
          age: ageNum,
          salary: salaryNum,
          hire_date: formData.hire_date,
          status: formData.status,
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          skills: skillsArray.length > 0 ? skillsArray : null,
        },
        isEdit
      );

      setFormError(null);
      onClose();
    } catch (_error) {
      setFormError(
        `Failed to ${isEdit ? "update" : "add"} employee. Please try again.`
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? "Edit Employee" : "Add New Employee"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {formError && <Alert variant="danger">{formError}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formName">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                placeholder="Enter full name"
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formEmail">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                required
                placeholder="Enter email address"
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formRole">
              <Form.Label>Role *</Form.Label>
              <Form.Select
                name="role_id"
                value={formData.role_id}
                onChange={handleFormChange}
                required
              >
                <option value="">Select role</option>
                {Object.entries(roles).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group as={Col} controlId="formDepartment">
              <Form.Label>Department *</Form.Label>
              <Form.Select
                name="department_id"
                value={formData.department_id}
                onChange={handleFormChange}
                required
              >
                <option value="">Select department</option>
                {Object.entries(departments).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formAge">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                name="age"
                min="18"
                max="120"
                value={formData.age}
                onChange={handleFormChange}
                placeholder="e.g. 30"
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formSalary">
              <Form.Label>Salary</Form.Label>
              <Form.Control
                type="number"
                name="salary"
                min="0"
                step="0.01"
                value={formData.salary}
                onChange={handleFormChange}
                placeholder="e.g. 75000.00"
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formHireDate">
              <Form.Label>Hire Date *</Form.Label>
              <Form.Control
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formStatus">
              <Form.Label>Status *</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </Form.Select>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="e.g. 555-123-4567"
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formAddress">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                placeholder="e.g. 123 Main St, New Orleans, LA"
              />
            </Form.Group>
          </Row>

          <Form.Group className="mb-3" controlId="formSkills">
            <Form.Label>Skills (comma-separated)</Form.Label>
            <Form.Control
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleFormChange}
              placeholder="e.g., Python, JavaScript, SQL"
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
                ? "Update Employee"
                : "Add Employee"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
