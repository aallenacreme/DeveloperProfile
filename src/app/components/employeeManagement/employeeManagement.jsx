// src/components/employeeManagement/EmployeeManagement.jsx
import { useState, useEffect } from "react";
import { Container, Table, Spinner, Alert, Button } from "react-bootstrap";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../auth";
import { useNavigate } from "react-router-dom";

import AddEmployeeModal from "./AddEmployeeModal";
import ViewEmployeeModal from "./ViewEmployeeModal";

import "./EmployeeManagement.css";

function EmployeeManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState({});
  const [roles, setRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch departments
        const { data: deptData } = await supabase
          .from("departments")
          .select("id, name");
        const deptMap = {};
        deptData.forEach((dept) => (deptMap[dept.id] = dept.name));
        setDepartments(deptMap);

        // Fetch roles
        const { data: roleData } = await supabase
          .from("roles")
          .select("id, name");
        const roleMap = {};
        roleData.forEach((role) => (roleMap[role.id] = role.name));
        setRoles(roleMap);

        // Fetch employees
        const { data: employeeData, error } = await supabase
          .from("employees")
          .select("*")
          .eq("created_by", user.id);

        if (error) throw error;
        setEmployees(employeeData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleBackToProfile = () => {
    navigate("/");
  };

  const handleViewProfile = (employee) => {
    setSelectedEmployee(employee);
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedEmployee(null);
  };

  const handleShowAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleAddEmployee = async (newEmployeeData) => {
    const { data, error } = await supabase
      .from("employees")
      .insert([newEmployeeData])
      .select(); // <-- This ensures Supabase returns the inserted record(s)

    if (error) throw error;

    // Now `data` will contain the new employee
    setEmployees((prev) => [...prev, data[0]]);
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger" className="mt-4">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="employee-management-container standalone-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="outline-secondary"
            onClick={handleBackToProfile}
            className="me-2"
          >
            ← Back to Profile
          </Button>
          <h2 className="page-title">Employee Management</h2>
        </div>
        <Button
          variant="primary"
          className="add-employee-btn"
          onClick={handleShowAddModal}
        >
          + Add Employee
        </Button>
      </div>

      {employees.length === 0 ? (
        <div className="no-employees text-center py-5">
          <h4>No employees found</h4>
          <p>Get started by adding your first employee</p>
          <Button variant="outline-primary" onClick={handleShowAddModal}>
            Add Employee
          </Button>
        </div>
      ) : (
        <div className="employee-table-container">
          <Table striped bordered hover responsive className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Hire Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{roles[employee.role_id] || "N/A"}</td>
                  <td>{departments[employee.department_id] || "N/A"}</td>
                  <td>{formatDate(employee.hire_date)}</td>
                  <td>
                    <span className={`status-badge ${employee.status}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleViewProfile(employee)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        show={showAddModal}
        onClose={handleCloseAddModal}
        onAdd={handleAddEmployee}
        roles={roles}
        departments={departments}
        userId={user.id}
      />

      {/* View Employee Modal */}
      <ViewEmployeeModal
        show={showProfileModal}
        onClose={handleCloseProfileModal}
        employee={selectedEmployee}
        roles={roles}
        departments={departments}
        formatDate={formatDate}
      />
    </Container>
  );
}

export default EmployeeManagement;
