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

        const [profile, employees, activeEmployees, departments, roles, tasks] =
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
            supabase.from("roles").select("id", { count: "exact" }),
            supabase
              .from("tasks")
              .select("id", { count: "exact" })
              .eq("created_by", user.id),
          ]);

        setUsername(profile.data?.username || "User");
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
            Manage your employees, departments, roles, and tasks with ease.
          </p>
        </div>
      </header>
      <Row className="mt-5">
        <HomepageCard
          title="Employees"
          icon="👥"
          text={`Total: ${employeeCount} | Active: ${activeEmployeeCount}`}
          to="/employees"
        />
        <HomepageCard
          title="Departments"
          icon="🏢"
          text={`Total: ${departmentCount}`}
          to="/departments"
        />
        <HomepageCard
          title="Roles"
          icon="🎭"
          text={`Total: ${roleCount}`}
          to="/roles"
        />
        <HomepageCard
          title="Task Management"
          icon="📋"
          text={`Total: ${taskCount}`}
          to="/tasks"
        />
      </Row>
    </Container>
  );
}

function HomepageCard({ title, icon, text, to }) {
  return (
    <Col xs={12} md={3} className="mb-4">
      <Card className="homepage-card">
        <Card.Body>
          <div className="card-icon">{icon}</div>
          <Card.Title>{title}</Card.Title>
          <Card.Text>{text}</Card.Text>
          <Button variant="primary" as={Link} to={to} className="card-btn">
            Manage {title}
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default HomepageManagement;
