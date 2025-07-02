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
import TaskFormModal from "./TaskFormModal";
import "./Management.css";

function TaskManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const hasFetched = useRef(false);
  const channelRef = useRef(null);

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    show: false,
    mode: "add",
    task: null,
  });
  const [searchTerm, setSearchTerm] = useState("");

  // ⬇️ One-time fetch using user.id (not full object)
  useEffect(() => {
    if (!user?.id || hasFetched.current) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: employeeData, error: employeeError } = await supabase
          .from("employees")
          .select("id, name, user_id")
          .eq("created_by", user.id);

        if (employeeError) throw employeeError;

        const employeeMap = employeeData?.reduce(
          (acc, emp) => ({ ...acc, [emp.user_id]: emp.name }),
          {}
        );

        setEmployees(employeeMap || {});

        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .select("*")
          .eq("created_by", user.id);

        if (taskError) throw taskError;

        setTasks(taskData || []);
        setFilteredTasks(taskData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load task data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    hasFetched.current = true;
  }, [user?.id]);

  // ⬇️ Real-time listener (set up once)
  useEffect(() => {
    if (!user?.id || channelRef.current) return;

    const channel = supabase
      .channel("tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `created_by=eq.${user.id}`,
        },
        (payload) => {
          const { eventType, new: newTask, old: oldTask } = payload;

          if (eventType === "INSERT") {
            setTasks((prev) => [...prev, newTask]);
            setFilteredTasks((prev) => [...prev, newTask]);
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
  }, [user?.id]);

  // ⬇️ Filter tasks based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTasks(tasks);
      return;
    }

    const lower = searchTerm.toLowerCase();
    setFilteredTasks(
      tasks.filter((task) => {
        return (
          task.title?.toLowerCase().includes(lower) ||
          task.description?.toLowerCase().includes(lower) ||
          task.employee_description?.toLowerCase().includes(lower) ||
          task.status?.toLowerCase().includes(lower) ||
          employees[task.assigned_to]?.toLowerCase().includes(lower)
        );
      })
    );
  }, [searchTerm, tasks, employees]);

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

  const handleAddOrUpdateTask = async (taskData, isUpdate = false) => {
    try {
      setError(null);
      let response;

      if (isUpdate) {
        const { data, error } = await supabase
          .from("tasks")
          .update(taskData)
          .eq("id", modalConfig.task?.id)
          .select();
        if (error) throw error;
        response = data?.[0];
      } else {
        const { data, error } = await supabase
          .from("tasks")
          .insert({ ...taskData, created_by: user?.id })
          .select();
        if (error) throw error;
        response = data?.[0];
      }

      if (!response) throw new Error("No response");

      const updated = [...tasks.filter((t) => t.id !== response.id), response];
      setTasks(updated);
      setFilteredTasks(updated);
      setModalConfig({ show: false, mode: "add", task: null });
    } catch (err) {
      console.error("Task save error:", err);
      setError("Failed to add/update task");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      const updated = tasks.filter((t) => t.id !== id);
      setTasks(updated);
      setFilteredTasks(updated);
    } catch (err) {
      console.error("Task delete error:", err);
      setError("Failed to delete task");
    }
  };

  if (!user) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" variant="primary" />
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
          <h2 className="page-title">Task Management</h2>
        </div>
        <Button
          variant="primary"
          className="add-employee-btn"
          onClick={() =>
            setModalConfig({ show: true, mode: "add", task: null })
          }
        >
          + Add Task
        </Button>
      </div>

      <Form className="mb-3">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Search tasks..."
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

      {filteredTasks.length === 0 ? (
        <div className="no-employees text-center py-5">
          <h4>{searchTerm ? "No matching tasks found" : "No tasks found"}</h4>
          <p>
            {searchTerm
              ? "Try a different search term"
              : "Get started by adding your first task"}
          </p>
          {!searchTerm && (
            <Button
              variant="outline-primary"
              onClick={() =>
                setModalConfig({ show: true, mode: "add", task: null })
              }
            >
              Add Task
            </Button>
          )}
        </div>
      ) : (
        <div className="employee-table-container">
          <Table striped bordered hover responsive className="employee-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Assigned Employee</th>
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
                  <td>{employees[task.assigned_to] || "Unassigned"}</td>
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
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() =>
                        setModalConfig({ show: true, mode: "edit", task })
                      }
                      className="me-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
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

      <TaskFormModal
        show={modalConfig.show}
        mode={modalConfig.mode}
        task={modalConfig.task}
        onClose={() => setModalConfig({ show: false, mode: "add", task: null })}
        onSubmit={handleAddOrUpdateTask}
        employees={employees}
      />
    </Container>
  );
}

export default TaskManagement;
