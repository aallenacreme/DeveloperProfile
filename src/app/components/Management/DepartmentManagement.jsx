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
import DepartmentFormModal from "./DepartmentFormModal";
import "./employeeManagement.css";

function DepartmentManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalConfig, setModalConfig] = useState({
    show: false,
    mode: "add",
    department: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: deptData, error: deptError } = await supabase
          .from("departments")
          .select("id, name, description");
        if (deptError) throw deptError;
        setDepartments(deptData || []);

        const { data: employeeData, error: empError } = await supabase
          .from("employees")
          .select("id, department_id")
          .eq("created_by", user.id);
        if (empError) throw empError;
        setEmployees(employeeData || []);

        setFilteredDepartments(deptData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load department data");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  // Handle search filtering
  useEffect(() => {
    if (!searchTerm) {
      setFilteredDepartments(departments);
      return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    setFilteredDepartments(
      departments.filter(
        (dept) =>
          dept.name?.toLowerCase().includes(lowerSearchTerm) ||
          dept.description?.toLowerCase().includes(lowerSearchTerm)
      )
    );
  }, [searchTerm, departments]);

  const getEmployeeCount = (deptId) => {
    return employees.filter((emp) => emp.department_id === deptId).length;
  };

  const handleAddOrUpdateDepartment = async (deptData, isUpdate = false) => {
    let data;
    try {
      if (isUpdate) {
        const { data: updatedData, error } = await supabase
          .from("departments")
          .update(deptData)
          .eq("id", modalConfig.department.id)
          .select();
        if (error) throw error;
        data = updatedData[0];
        setDepartments((prev) =>
          prev.map((dept) => (dept.id === data.id ? data : dept))
        );
      } else {
        const { data: newData, error } = await supabase
          .from("departments")
          .insert([deptData])
          .select();
        if (error) throw error;
        data = newData[0];
        setDepartments((prev) => [...prev, data]);
      }
      setFilteredDepartments((prev) =>
        isUpdate
          ? prev.map((dept) => (dept.id === data.id ? data : dept))
          : [...prev, data]
      );
      setModalConfig({ show: false, mode: "add", department: null });
    } catch (error) {
      console.error(
        `Error ${isUpdate ? "updating" : "adding"} department:`,
        error
      );
      throw error;
    }
    return data;
  };

  const handleDeleteDepartment = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this department? Employees will have no department assigned."
      )
    ) {
      return;
    }
    try {
      const { error } = await supabase
        .from("departments")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setDepartments((prev) => prev.filter((dept) => dept.id !== id));
      setFilteredDepartments((prev) => prev.filter((dept) => dept.id !== id));
    } catch (error) {
      console.error("Error deleting department:", error);
      setError("Failed to delete department");
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
            ← Back to HomePage
          </Button>
          <h2 className="page-title">Department Management</h2>
        </div>
        <Button
          variant="primary"
          className="add-employee-btn"
          onClick={() =>
            setModalConfig({ show: true, mode: "add", department: null })
          }
        >
          + Add Department
        </Button>
      </div>

      <Form className="mb-3">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Search departments by name or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
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

      {filteredDepartments.length === 0 ? (
        <div className="no-employees text-center py-5">
          <h4>
            {searchTerm
              ? "No matching departments found"
              : "No departments found"}
          </h4>
          <p>
            {searchTerm
              ? "Try a different search term"
              : "Get started by adding your first department"}
          </p>
          {!searchTerm && (
            <Button
              variant="outline-primary"
              onClick={() =>
                setModalConfig({ show: true, mode: "add", department: null })
              }
            >
              Add Department
            </Button>
          )}
        </div>
      ) : (
        <div className="employee-table-container">
          <Table striped bordered hover responsive className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee Count</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map((dept) => (
                <tr key={dept.id}>
                  <td>{dept.name}</td>
                  <td>{getEmployeeCount(dept.id)}</td>
                  <td>{dept.description || "N/A"}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() =>
                        setModalConfig({
                          show: true,
                          mode: "edit",
                          department: dept,
                        })
                      }
                      className="me-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteDepartment(dept.id)}
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

      <DepartmentFormModal
        show={modalConfig.show}
        mode={modalConfig.mode}
        department={modalConfig.department}
        onClose={() =>
          setModalConfig({ show: false, mode: "add", department: null })
        }
        onSubmit={handleAddOrUpdateDepartment}
      />
    </Container>
  );
}

export default DepartmentManagement;
