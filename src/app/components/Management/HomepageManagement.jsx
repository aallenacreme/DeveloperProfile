import { useState, useEffect } from "react";
import {
  Container,
  Spinner,
  Alert,
  Button,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../auth";
import { Link, useNavigate } from "react-router-dom";
import "./homepage.css";

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [employeeCount, setEmployeeCount] = useState(0);
  const [activeEmployeeCount, setActiveEmployeeCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [roleCount, setRoleCount] = useState(0); // Added for roles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profile, employees, activeEmployees, departments, roles] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("username")
              .eq("user_id", user.id)
              .single(),
            supabase
              .from("employees")
              .select("id", { count: "exact" })
              .eq("created_by", user.id),
            supabase
              .from("employees")
              .select("id", { count: "exact" })
              .eq("created_by", user.id)
              .eq("status", "active"),
            supabase.from("departments").select("id", { count: "exact" }),
            supabase.from("roles").select("id", { count: "exact" }), // Fetch role count
          ]);

        setUsername(profile.data?.username || "User");
        setEmployeeCount(employees.count || 0);
        setActiveEmployeeCount(activeEmployees.count || 0);
        setDepartmentCount(departments.count || 0);
        setRoleCount(roles.count || 0); // Set role count
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load homepage data");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="homepage-container">
      {error && (
        <Alert
          variant="danger"
          className="mt-4 mx-auto"
          style={{ maxWidth: "600px" }}
        >
          {error}
        </Alert>
      )}
      <header className="header-section">
        <Button
          variant="outline-secondary"
          onClick={() => navigate("/")}
          className="back-btn"
        >
          ← Back to Profile
        </Button>
        <div className="header-content">
          <h1 className="page-title">Welcome, {username}!</h1>
          <p className="page-subtitle">
            Manage your employees, departments, and roles with ease.
          </p>
        </div>
      </header>
      <Row className="mt-5">
        <Col xs={12} md={4} className="mb-4">
          <Card className="homepage-card">
            <Card.Body>
              <div className="card-icon">👥</div>
              <Card.Title>Employees</Card.Title>
              <Card.Text>
                Total: {employeeCount} | Active: {activeEmployeeCount}
              </Card.Text>
              <Button
                variant="primary"
                as={Link}
                to="/employees"
                className="card-btn"
              >
                Manage Employees
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4} className="mb-4">
          <Card className="homepage-card">
            <Card.Body>
              <div className="card-icon">🏢</div>
              <Card.Title>Departments</Card.Title>
              <Card.Text>Total: {departmentCount}</Card.Text>
              <Button
                variant="primary"
                as={Link}
                to="/departments"
                className="card-btn"
              >
                Manage Departments
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4} className="mb-4">
          <Card className="homepage-card">
            <Card.Body>
              <div className="card-icon">🎭</div>
              <Card.Title>Roles</Card.Title>
              <Card.Text>Total: {roleCount}</Card.Text>
              <Button
                variant="primary"
                as={Link}
                to="/roles"
                className="card-btn"
              >
                Manage Roles
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;
