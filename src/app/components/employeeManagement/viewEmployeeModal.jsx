// src/components/employeeManagement/ViewEmployeeModal.jsx
import { Modal, Button } from "react-bootstrap";

export default function ViewEmployeeModal({
  show,
  onClose,
  employee,
  roles,
  departments,
  formatDate,
}) {
  if (!employee) return null;

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{employee.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Email:</strong> {employee.email}
        </p>
        <p>
          <strong>Role:</strong> {roles[employee.role_id] || "N/A"}
        </p>
        <p>
          <strong>Department:</strong>{" "}
          {departments[employee.department_id] || "N/A"}
        </p>
        <p>
          <strong>Age:</strong> {employee.age || "N/A"}
        </p>
        <p>
          <strong>Salary:</strong>{" "}
          {employee.salary != null ? `$${employee.salary.toFixed(2)}` : "N/A"}
        </p>
        <p>
          <strong>Hire Date:</strong> {formatDate(employee.hire_date)}
        </p>
        <p>
          <strong>Status:</strong> {employee.status}
        </p>
        <p>
          <strong>Phone:</strong> {employee.phone || "N/A"}
        </p>
        <p>
          <strong>Address:</strong> {employee.address || "N/A"}
        </p>
        <p>
          <strong>Skills:</strong>{" "}
          {employee.skills?.length > 0 ? employee.skills.join(", ") : "N/A"}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
