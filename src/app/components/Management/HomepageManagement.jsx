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
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch conversations for the user to get their IDs
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("user_id", user.id)
          .single();
        if (profileError) throw profileError;

        const [
          employees,
          activeEmployees,
          departments,
          roles,
          tasks,
          conversations,
        ] = await Promise.all([
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
          supabase
            .from("conversations")
            .select("id")
            .or(`participant1.eq.${user.id},participant2.eq.${user.id}`),
        ]);

        setUsername(profileData?.username || "User");
        setEmployeeCount(employees.count || 0);
        setActiveEmployeeCount(activeEmployees.count || 0);
        setDepartmentCount(departments.count || 0);
        setRoleCount(roles.count || 0);
        setTaskCount(tasks.count || 0);

        // Count messages in all user's conversations
        let totalMessages = 0;
        if (conversations.data && conversations.data.length > 0) {
          const conversationIds = conversations.data.map((c) => c.id);

          const { count: messageCountResult, error: messageCountError } =
            await supabase
              .from("messages")
              .select("id", { count: "exact", head: true })
              .in("conversation_id", conversationIds);

          if (messageCountError) throw messageCountError;
          totalMessages = messageCountResult || 0;
        }
        setMessageCount(totalMessages);
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
            Manage your employees, departments, roles, tasks, and messages with
            ease.
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
        <HomepageCard
          title="Messages"
          icon="💬"
          text={`Total: ${messageCount}`}
          to="/messages"
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
