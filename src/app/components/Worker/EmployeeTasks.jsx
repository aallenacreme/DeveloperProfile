import { useState, useEffect, useRef } from "react";
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

function EmployeeTasks() {
  const { user, isEmployee } = useAuth();
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const channelRef = useRef(null);

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [creators, setCreators] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch tasks and creator names
  useEffect(() => {
    if (!user?.id || !isEmployee || hasFetched.current) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .select("*, profiles!tasks_created_by_fkey(name)")
          .eq("assigned_to", user.id);

        if (taskError) throw taskError;

        const creatorMap = taskData?.reduce(
          (acc, task) => ({
            ...acc,
            [task.created_by]: task.profiles?.name || "Unknown",
          }),
          {}
        );

        setCreators(creatorMap || {});
        setTasks(taskData || []);
        setFilteredTasks(taskData || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    hasFetched.current = true;
  }, [user?.id, isEmployee]);

  // Real-time listener for tasks
  useEffect(() => {
    if (!user?.id || !isEmployee || channelRef.current) return;

    const channel = supabase
      .channel("employee_tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `assigned_to=eq.${user.id}`,
        },
        (payload) => {
          const { eventType, new: newTask, old: oldTask } = payload;

          if (eventType === "INSERT") {
            setTasks((prev) => [...prev, newTask]);
            setFilteredTasks((prev) => [...prev, newTask]);
            setCreators((prev) => ({
              ...prev,
              [newTask.created_by]: newTask.profiles?.name || "Unknown",
            }));
          } else if (eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((t) => (t.id === newTask.id ? newTask : t))
            );
            setFilteredTasks((prev) =>
              prev.map((t) => (t.id === newTask.id ? newTask : t))
            );
          } else if (eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== oldTask.id));
            setFilteredTasks((prev) => prev.filter((t) => t.id !== oldTask.id));
          }
        }
      )
      .subscribe()
      .on("error", (err) => {
        console.error("Realtime channel error:", err);
        setError("Realtime connection error");
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user?.id, isEmployee]);

  // Filter tasks by status
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter((task) => task.status === statusFilter));
    }
  }, [statusFilter, tasks]);

  // Handle Accept/Decline actions
  const handleTaskAction = async (taskId, newStatus) => {
    try {
      setError(null);
      const { error, data } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId)
        .select(); // Add .select() to get updated row

      console.log("Update result:", { error, data });
      if (error) throw error;
    } catch (err) {
      console.error(`Error updating task to ${newStatus}:`, err);
      setError(`Failed to ${newStatus} task`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  if (!isEmployee) {
    return (
      <Container>
        <Alert variant="danger">Access Denied: Employees only</Alert>
      </Container>
    );
  }

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
          <Button variant="link" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/employee-dashboard")}
            className="me-2"
          >
            ← Back to Dashboard
          </Button>
          <h2>Assigned Tasks</h2>
        </div>
      </div>

      <Form className="mb-3">
        <InputGroup>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
          </Form.Select>
          {statusFilter !== "all" && (
            <Button
              variant="outline-secondary"
              onClick={() => setStatusFilter("all")}
            >
              Clear
            </Button>
          )}
        </InputGroup>
      </Form>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-5">
          <h4>
            {statusFilter === "all"
              ? "No tasks assigned"
              : `No ${statusFilter} tasks found`}
          </h4>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Created By</th>
              <th>Status</th>
              <th>Employee Notes</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title || "N/A"}</td>
                <td>{task.description || "N/A"}</td>
                <td>{creators[task.created_by] || "Unknown"}</td>
                <td>
                  <span
                    className={`status-badge ${
                      task.status?.toLowerCase() || "unknown"
                    }`}
                  >
                    {task.status || "Unknown"}
                  </span>
                </td>
                <td>{task.employee_description || "N/A"}</td>
                <td>{formatDate(task.created_at)}</td>
                <td>{formatDate(task.updated_at)}</td>
                <td>
                  {task.status === "pending" && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-1"
                        onClick={() => handleTaskAction(task.id, "accepted")}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleTaskAction(task.id, "declined")}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  {task.status === "accepted" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleTaskAction(task.id, "completed")}
                    >
                      Complete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default EmployeeTasks;
