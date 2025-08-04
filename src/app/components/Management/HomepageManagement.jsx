import { useState, useEffect, useRef } from "react";
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

function HomepageManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const [username, setUsername] = useState("User");
  const [employeeCount, setEmployeeCount] = useState(0);
  const [activeEmployeeCount, setActiveEmployeeCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [roleCount, setRoleCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user profile and other counts, excluding messages
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("user_id", user.id)
          .single();
        if (profileError) throw profileError;

        const [employees, activeEmployees, departments, roles, tasks] =
          await Promise.all([
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
            supabase.from("roles").select("id", { count: "exact" }),
            supabase
              .from("tasks")
              .select("id", { count: "exact" })
              .eq("created_by", user.id),
          ]);

        setUsername(profileData?.username || "User");
        setEmployeeCount(employees.count || 0);
        setActiveEmployeeCount(activeEmployees.count || 0);
        setDepartmentCount(departments.count || 0);
        setRoleCount(roles.count || 0);
        setTaskCount(tasks.count || 0);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load homepage data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && !hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <Container
        className="dashboard-container d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <div className="dashboard-container">
      {error && (
        <Alert
          variant="danger"
          className="alert-modern mt-4 mx-auto"
          style={{ maxWidth: "600px" }}
        >
          {error}
        </Alert>
      )}
      
      <header className="dashboard-header py-4">
        <div className="header-content container mx-auto px-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button
              variant="light"
              onClick={() => navigate("/")}
              className="back-btn"
            >
              ← Back to Profile
            </Button>
          </div>
          <div className="welcome-section">
            <h1 className="dashboard-title">Welcome, {username}!</h1>
            <p className="dashboard-subtitle">
              Manage your employees, departments, roles, tasks, and messages with ease.
            </p>
          </div>
        </div>
      </header>

      <div className="dashboard-content container mx-auto px-4 py-5">
        <Row>
          <Col md={4} className="mb-4">
            <Card className="dashboard-card card-employee h-100">
              <div className="card-icon-container">
                <span className="card-icon">👥</span>
              </div>
              <Card.Body className="card-content">
                <Card.Title className="card-title">Employees</Card.Title>
                <div className="card-value">{employeeCount}</div>
                <div className="card-subvalue">Active: {activeEmployeeCount}</div>
                <p className="card-description">
                  Manage all your employees in one place
                </p>
                <Button
                  as={Link}
                  to="/employees"
                  variant="outline-primary"
                  className="card-btn"
                >
                  View Employees
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="dashboard-card card-department h-100">
              <div className="card-icon-container">
                <span className="card-icon">🏢</span>
              </div>
              <Card.Body className="card-content">
                <Card.Title className="card-title">Departments</Card.Title>
                <div className="card-value">{departmentCount}</div>
                <p className="card-description">
                  Organize your company structure
                </p>
                <Button
                  as={Link}
                  to="/departments"
                  variant="outline-primary"
                  className="card-btn"
                >
                  View Departments
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="dashboard-card card-role h-100">
              <div className="card-icon-container">
                <span className="card-icon">🎭</span>
              </div>
              <Card.Body className="card-content">
                <Card.Title className="card-title">Roles</Card.Title>
                <div className="card-value">{roleCount}</div>
                <p className="card-description">
                  Define job roles and responsibilities
                </p>
                <Button
                  as={Link}
                  to="/roles"
                  variant="outline-primary"
                  className="card-btn"
                >
                  View Roles
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="dashboard-card card-task h-100">
              <div className="card-icon-container">
                <span className="card-icon">📋</span>
              </div>
              <Card.Body className="card-content">
                <Card.Title className="card-title">Tasks</Card.Title>
                <div className="card-value">{taskCount}</div>
                <p className="card-description">
                  Track and assign work tasks
                </p>
                <Button
                  as={Link}
                  to="/tasks"
                  variant="outline-primary"
                  className="card-btn"
                >
                  View Tasks
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="dashboard-card card-message h-100">
              <div className="card-icon-container">
                <span className="card-icon">💬</span>
              </div>
              <Card.Body className="card-content">
                <Card.Title className="card-title">Messages</Card.Title>
                <div className="card-value">0</div>
                <p className="card-description">
                  Communicate with your team
                </p>
                <Button
                  as={Link}
                  to="/messages"
                  variant="outline-primary"
                  className="card-btn"
                >
                  View Messages
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default HomepageManagement;