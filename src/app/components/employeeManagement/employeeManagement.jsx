import { useState, useEffect } from "react";
import { Container, Table, Spinner, Alert, Button } from "react-bootstrap";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../auth";
import { useNavigate } from "react-router-dom";
import EmployeeFormModal from "./EmployeeFormModal";
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ show: false, mode: "add", employee: null });
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: deptData } = await supabase.from("departments").select("id, name");
        setDepartments(deptData.reduce((acc, dept) => ({ ...acc, [dept.id]: dept.name }), {}));

        const { data: roleData } = await supabase.from("roles").select("id, name");
        setRoles(roleData.reduce((acc, role) => ({ ...acc, [role.id]: role.name }), {}));

        const { data: employeeData, error } = await supabase
          .from("employees")
          .select("*")
          .eq("created_by", user.id);
        if (error) throw error;

        setEmployees([...(employeeData || [])].sort((a, b) => a.name.localeCompare(b.name)));
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

  const sortData = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });

    const sorted = [...employees].sort((a, b) => {
      if (key === "role_id") {
        const aValue = roles[a[key]] || "N/A";
        const bValue = roles[b[key]] || "N/A";
        return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (key === "department_id") {
        const aValue = departments[a[key]] || "N/A";
        const bValue = departments[b[key]] || "N/A";
        return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (key === "hire_date") {
        const aDate = new Date(a[key] || 0);
        const bDate = new Date(b[key] || 0);
        return direction === "asc" ? aDate - bDate : bDate - aDate;
      }
      return direction === "asc"
        ? (a[key] || "").localeCompare(b[key] || "")
        : (b[key] || "").localeCompare(a[key] || "");
    });
    setEmployees(sorted);
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? " ↑" : " ↓";
    }
    return " ↕";
  };

  const handleAddOrUpdateEmployee = async (employeeData, isUpdate = false) => {
    let data;
    if (isUpdate) {
      const { data: updatedData, error } = await supabase
        .from("employees")
        .update(employeeData)
        .eq("id", modalConfig.employee.id)
        .select();
      if (error) throw error;
      data = updatedData[0];
      setEmployees((prev) =>
        [...prev.filter((e) => e.id !== data.id), data].sort((a, b) =>
          sortConfig.direction === "asc"
            ? (a[sortConfig.key] || "").localeCompare(b[sortConfig.key] || "")
            : (b[sortConfig.key] || "").localeCompare(a[sortConfig.key] || "")
        )
      );
    } else {
      const { data: newData, error } = await supabase
        .from("employees")
        .insert([{ ...employeeData, created_by: user.id }])
        .select();
      if (error) throw error;
      data = newData[0];
      setEmployees((prev) =>
        [...prev, data].sort((a, b) =>
          sortConfig.direction === "asc"
            ? (a[sortConfig.key] || "").localeCompare(b[sortConfig.key] || "")
            : (b[sortConfig.key] || "").localeCompare(a[sortConfig.key] || "")
        )
      );
    }
    setModalConfig({ show: false, mode: "add", employee: null });
    return data;
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
      setEmployees((prev) => prev.filter((employee) => employee.id !== id));
    } catch (error) {
      console.error("Error deleting employee:", error);
      setError("Failed to delete employee");
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger" className="mt-4">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="employee-management-container standalone-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button variant="outline-secondary" onClick={() => navigate("/")} className="me-2">
            ← Back to Profile
          </Button>
          <h2 className="page-title">Employee Management</h2>
        </div>
        <Button
          variant="primary"
          className="add-employee-btn"
          onClick={() => setModalConfig({ show: true, mode: "add", employee: null })}
        >
          + Add Employee
        </Button>
      </div>

      {employees.length === 0 ? (
        <div className="no-employees text-center py-5">
          <h4>No employees found</h4>
          <p>Get started by adding your first employee</p>
          <Button
            variant="outline-primary"
            onClick={() => setModalConfig({ show: true, mode: "add", employee: null })}
          >
            Add Employee
          </Button>
        </div>
      ) : (
        <div className="employee-table-container">
          <Table striped bordered hover responsive className="employee-table">
            <thead>
              <tr>
                <th onClick={() => sortData("name")} style={{ cursor: "pointer" }}>
                  Name {getSortIndicator("name")}
                </th>
                <th onClick={() => sortData("email")} style={{ cursor: "pointer" }}>
                  Email {getSortIndicator("email")}
                </th>
                <th onClick={() => sortData("role_id")} style={{ cursor: "pointer" }}>
                  Role {getSortIndicator("role_id")}
                </th>
                <th onClick={() => sortData("department_id")} style={{ cursor: "pointer" }}>
                  Department {getSortIndicator("department_id")}
                </th>
                <th onClick={() => sortData("hire_date")} style={{ cursor: "pointer" }}>
                  Hire Date {getSortIndicator("hire_date")}
                </th>
                <th onClick={() => sortData("status")} style={{ cursor: "pointer" }}>
                  Status {getSortIndicator("status")}
                </th>
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
                      onClick={() => setShowProfileModal(true) || setModalConfig({ ...modalConfig, employee })}
                      className="me-1"
                    >
                      View
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => setModalConfig({ show: true, mode: "edit", employee })}
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
        onClose={() => setModalConfig({ show: false, mode: "add", employee: null })}
        onSubmit={handleAddOrUpdateEmployee}
        roles={roles}
        departments={departments}
      />
      <ViewEmployeeModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false) || setModalConfig({ ...modalConfig, employee: null })}
        employee={modalConfig.employee}
        roles={roles}
        departments={departments}
        formatDate={formatDate}
      />
    </Container>
  );
}

export default EmployeeManagement;