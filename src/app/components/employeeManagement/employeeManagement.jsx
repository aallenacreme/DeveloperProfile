import React, { useState } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState('');
  const [salary, setSalary] = useState('');

  const addEmployee = () => {
    if (name && salary) {
      setEmployees([...employees, { id: Date.now(), name, salary: parseFloat(salary) }]);
      setName('');
      setSalary('');
    }
  };

  const deleteEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  return (
    <Container className="mt-5">
      <h1>Employee Management System</h1>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Employee Name"
          />
        </Col>
        <Col md={4}>
          <Form.Control
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="Salary"
          />
        </Col>
        <Col md={4}>
          <Button variant="primary" onClick={addEmployee}>Add Employee</Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <h3>Employees</h3>
          <ul className="list-group">
            {employees.map((emp) => (
              <li key={emp.id} className="list-group-item d-flex justify-content-between align-items-center">
                {emp.name} - ${emp.salary}
                <Button variant="danger" size="sm" onClick={() => deleteEmployee(emp.id)}>Delete</Button>
              </li>
            ))}
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default EmployeeManagement;