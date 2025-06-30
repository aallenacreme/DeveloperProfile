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
import RoleFormModal from "./RoleFormModal";
import "./Management.css";

function RoleManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalConfig, setModalConfig] = useState({
    show: false,
    mode: "add",
    role: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("id, name, description");
        if (roleError) throw roleError;
        setRoles(roleData || []);

        const { data: employeeData, error: empError } = await supabase
          .from("employees")
          .select("id, role_id")
          .eq("created_by", user.id);
        if (empError) throw empError;
        setEmployees(employeeData || []);

        setFilteredRoles(roleData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load role data");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, []);

  // Handle search filtering
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRoles(roles);
      return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    setFilteredRoles(
      roles.filter(
        (role) =>
          role.name?.toLowerCase().includes(lowerSearchTerm) ||
          role.description?.toLowerCase().includes(lowerSearchTerm)
      )
    );
  }, [searchTerm, roles]);

  const getEmployeeCount = (roleId) => {
    return employees.filter((emp) => emp.role_id === roleId).length;
  };

  const handleAddOrUpdateRole = async (roleData, isUpdate = false) => {
    let data;
    try {
      if (isUpdate) {
        const { data: updatedData, error } = await supabase
          .from("roles")
          .update(roleData)
          .eq("id", modalConfig.role.id)
          .select();
        if (error) throw error;
        data = updatedData[0];
        setRoles((prev) =>
          prev.map((role) => (role.id === data.id ? data : role))
        );
      } else {
        const { data: newData, error } = await supabase
          .from("roles")
          .insert([roleData])
          .select();
        if (error) throw error;
        data = newData[0];
        setRoles((prev) => [...prev, data]);
      }
      setFilteredRoles((prev) =>
        isUpdate
          ? prev.map((role) => (role.id === data.id ? data : role))
          : [...prev, data]
      );
      setModalConfig({ show: false, mode: "add", role: null });
    } catch (error) {
      console.error(`Error ${isUpdate ? "updating" : "adding"} role:`, error);
      throw error;
    }
    return data;
  };

  const handleDeleteRole = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this role? Employees will have no role assigned."
      )
    ) {
      return;
    }
    try {
      const { error } = await supabase.from("roles").delete().eq("id", id);
      if (error) throw error;
      setRoles((prev) => prev.filter((role) => role.id !== id));
      setFilteredRoles((prev) => prev.filter((role) => role.id !== id));
    } catch (error) {
      console.error("Error deleting role:", error);
      setError("Failed to delete role");
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
          <h2 className="page-title">Role Management</h2>
        </div>
        <Button
          variant="primary"
          className="add-employee-btn"
          onClick={() =>
            setModalConfig({ show: true, mode: "add", role: null })
          }
        >
          + Add Role
        </Button>
      </div>

      <Form className="mb-3">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Search roles by name or description"
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

      {filteredRoles.length === 0 ? (
        <div className="no-employees text-center py-5">
          <h4>{searchTerm ? "No matching roles found" : "No roles found"}</h4>
          <p>
            {searchTerm
              ? "Try a different search term"
              : "Get started by adding your first role"}
          </p>
          {!searchTerm && (
            <Button
              variant="outline-primary"
              onClick={() =>
                setModalConfig({ show: true, mode: "add", role: null })
              }
            >
              Add Role
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
              {filteredRoles.map((role) => (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td>{getEmployeeCount(role.id)}</td>
                  <td>{role.description || "N/A"}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() =>
                        setModalConfig({
                          show: true,
                          mode: "edit",
                          role: role,
                        })
                      }
                      className="me-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteRole(role.id)}
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

      <RoleFormModal
        show={modalConfig.show}
        mode={modalConfig.mode}
        role={modalConfig.role}
        onClose={() => setModalConfig({ show: false, mode: "add", role: null })}
        onSubmit={handleAddOrUpdateRole}
      />
    </Container>
  );
}

export default RoleManagement;
