import { useState, useEffect, useRef, useMemo } from "react";
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
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    show: false,
    mode: "add",
    task: null,
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch initial data
  useEffect(() => {
    if (!user?.id || hasFetched.current) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch employees
        const { data: employeeData, error: employeeError } = await supabase
          .from("employees")
          .select("id, name, user_id")
          .eq("created_by", user.id);
        if (employeeError) throw employeeError;
        setEmployees(
          employeeData.reduce(
            (acc, emp) => ({ ...acc, [emp.user_id]: emp.name }),
            {}
          )
        );

        // Fetch tasks with duplicate check
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .select("*")
          .eq("created_by", user.id);
        if (taskError) throw taskError;

        // Remove potential duplicates
        const uniqueTasks = taskData.filter(
          (task, index, self) =>
            index === self.findIndex((t) => t.id === task.id)
        );
        setTasks(uniqueTasks);
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

  // Real-time
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

          setTasks((prev) => {
            const taskExists = prev.some((task) => task.id === newTask?.id);

            switch (eventType) {
              case "INSERT":
                return taskExists ? prev : [...prev, newTask];
              case "UPDATE":
                return prev.map((t) => (t.id === newTask.id ? newTask : t));
              case "DELETE":
                return prev.filter((t) => t.id !== oldTask.id);
              default:
                return prev;
            }
          });
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user?.id]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!searchTerm) return tasks;
    const lower = searchTerm.toLowerCase();
    return tasks.filter((task) =>
      [
        task.title,
        task.description,
        task.employee_description,
        task.status,
        employees[task.assigned_to],
      ].some((field) => field?.toLowerCase().includes(lower))
    );
  }, [tasks, searchTerm, employees]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleAddOrUpdateTask = async (taskData, isUpdate = false) => {
    if (!taskData?.title || !taskData?.assigned_to) {
      setError("Title and assigned employee are required");
      return;
    }
    try {
      setError(null);
      await supabase
        .from("tasks")
        [isUpdate ? "update" : "insert"](
          isUpdate ? taskData : { ...taskData, created_by: user.id }
        )
        .eq("id", isUpdate ? modalConfig.task.id : undefined);

      setModalConfig({ show: false, mode: "add", task: null });
    } catch (err) {
      console.error("Task save error:", err);
      setError("Failed to save task");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await supabase.from("tasks").delete().eq("id", id);
    } catch (err) {
      console.error("Task delete error:", err);
      setError("Failed to delete task");
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
                {/* Removed Employee Notes column */}
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
                  {/* Removed Employee Notes cell */}
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
