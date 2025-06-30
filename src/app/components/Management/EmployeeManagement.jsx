import { useState, useEffect } from "react";
import {
  Container,
  Table,
  Spinner,
  Alert,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../auth";
import { useNavigate } from "react-router-dom";
import EmployeeFormModal from "./EmployeeFormModal";
import ViewEmployeeModal from "./ViewEmployeeModal";
import "./Management.css";

function EmployeeManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [departments, setDepartments] = useState({});
  const [roles, setRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    show: false,
    mode: "add",
    employee: null,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: deptData } = await supabase
          .from("departments")
          .select("id, name");
        setDepartments(
          deptData.reduce((acc, dept) => ({ ...acc, [dept.id]: dept.name }), {})
        );

        const { data: roleData } = await supabase
          .from("roles")
          .select("id, name");
        setRoles(
          roleData.reduce((acc, role) => ({ ...acc, [role.id]: role.name }), {})
        );

        const { data: employeeData, error } = await supabase
          .from("employees")
          .select("*")
          .eq("created_by", user.id);
        if (error) throw error;

        setEmployees(employeeData || []);
        setFilteredEmployees(employeeData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredEmployees(employees);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = employees.filter((employee) => {
      return (
        employee.name?.toLowerCase().includes(lowerSearchTerm) ||
        employee.email?.toLowerCase().includes(lowerSearchTerm) ||
        roles[employee.role_id]?.toLowerCase().includes(lowerSearchTerm) ||
        departments[employee.department_id]
          ?.toLowerCase()
          .includes(lowerSearchTerm) ||
        formatDate(employee.hire_date)
          ?.toLowerCase()
          .includes(lowerSearchTerm) ||
        employee.status?.toLowerCase().includes(lowerSearchTerm)
      );
    });
    setFilteredEmployees(filtered);
  }, [searchTerm, employees, roles, departments]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleAddOrUpdateEmployee = async (employeeData, isUpdate = false) => {
    try {
      let response;
      if (isUpdate) {
        // For updates, use direct Supabase call (Edge Function not designed for updates)
        const { data: updatedData, error } = await supabase
          .from("employees")
          .update(employeeData)
          .eq("id", modalConfig.employee.id)
          .select();
        if (error) throw error;
        response = updatedData[0];
      } else {
        // For adds, call the Edge Function
        const {
          data: { session },
        } = await supabase.auth.getSession();
        response = await fetch(
          "https://iwikoypoupxvpiortcci.functions.supabase.co/create-employee",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              ...employeeData,
              created_by: user.id,
            }),
          }
        );
        const result = await response.json();
        if (!result.success)
          throw new Error(result.error || "Failed to add employee");
        response = result.employee;
      }

      const updatedEmployees = [
        ...employees.filter((e) => e.id !== response.id),
        response,
      ];
      setEmployees(updatedEmployees);
      setFilteredEmployees(updatedEmployees);
      setModalConfig({ show: false, mode: "add", employee: null });
    } catch (error) {
      console.error("Error adding/updating employee:", error);
      setError("Failed to add/update employee");
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;
    try {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
      const updatedEmployees = employees.filter(
        (employee) => employee.id !== id
      );
      setEmployees(updatedEmployees);
      setFilteredEmployees(updatedEmployees);
    } catch (error) {
      console.error("Error deleting employee:", error);
      setError("Failed to delete employee");
    }
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
            onClick={() => navigate("/homepage-management")}
            className="me-2"
          >
            ← Back to Homepage
          </Button>
          <h2 className="page-title">Employee Management</h2>
        </div>
        <Button
          variant="primary"
          className="add-employee-btn"
          onClick={() =>
            setModalConfig({ show: true, mode: "add", employee: null })
          }
        >
          + Add Employee
        </Button>
      </div>

      <Form className="mb-3">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Search employees by name, email, role, department, hire date, or status"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="outline-secondary"
              onClick={() => setSearchTerm("")}
            >
              Clear
            </Button>
          )}
        </InputGroup>
      </Form>

      {filteredEmployees.length === 0 ? (
        <div className="no-employees text-center py-5">
          <h4>
            {searchTerm ? "No matching employees found" : "No employees found"}
          </h4>
          <p>
            {searchTerm
              ? "Try a different search term"
              : "Get started by adding your first employee"}
          </p>
          {!searchTerm && (
            <Button
              variant="outline-primary"
              onClick={() =>
                setModalConfig({ show: true, mode: "add", employee: null })
              }
            >
              Add Employee
            </Button>
          )}
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
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{roles[employee.role_id] || "N/A"}</td>
                  <td>{departments[employee.department_id] || "N/A"}</td>
                  <td>{formatDate(employee.hire_date)}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        employee.status ? employee.status.toString() : "unknown"
                      }`}
                    >
                      {employee.status || "Unknown"}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => {
                        setShowProfileModal(true);
                        setModalConfig({ ...modalConfig, employee });
                      }}
                      className="me-1"
                    >
                      View
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() =>
                        setModalConfig({ show: true, mode: "edit", employee })
                      }
                      className="me-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <EmployeeFormModal
        show={modalConfig.show}
        mode={modalConfig.mode}
        employee={modalConfig.employee}
        onClose={() =>
          setModalConfig({ show: false, mode: "add", employee: null })
        }
        onSubmit={handleAddOrUpdateEmployee}
        roles={roles}
        departments={departments}
      />
      <ViewEmployeeModal
        show={showProfileModal}
        onClose={() =>
          setShowProfileModal(false) ||
          setModalConfig({ ...modalConfig, employee: null })
        }
        employee={modalConfig.employee}
        roles={roles}
        departments={departments}
        formatDate={formatDate}
      />
    </Container>
  );
}

export default EmployeeManagement;
