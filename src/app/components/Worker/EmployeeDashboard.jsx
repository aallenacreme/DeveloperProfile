import { useState, useEffect, useRef } from "react";
import { Container, Button, Card } from "react-bootstrap";
import { useAuth } from "../../auth";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";

function EmployeeDashboard() {
  const { user, isEmployee } = useAuth();
  const navigate = useNavigate();
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);

  // Fetch initial task count
  useEffect(() => {
    if (!user?.id || !isEmployee) return;

    const fetchTaskCount = async () => {
      try {
        setLoading(true);
        setError(null);

        const { count, error } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("assigned_to", user.id)
          .eq("status", "pending");

        if (error) throw error;

        setTaskCount(count || 0);
      } catch (err) {
        console.error("Error fetching task count:", err);
        setError("Failed to load task count");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskCount();
  }, [user?.id, isEmployee]);

  // Real-time subscription for task count updates
  useEffect(() => {
    if (!user?.id || !isEmployee || channelRef.current) return;

    const channel = supabase
      .channel("employee-tasks")
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
          setTaskCount((prev) => {
            switch (eventType) {
              case "INSERT":
                return newTask.status === "pending" ? prev + 1 : prev;
              case "UPDATE":
                const wasPending = oldTask.status === "pending";
                const isPending = newTask.status === "pending";
                if (wasPending && !isPending) return prev - 1;
                if (!wasPending && isPending) return prev + 1;
                return prev;
              case "DELETE":
                return oldTask.status === "pending" ? prev - 1 : prev;
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
  }, [user?.id, isEmployee]);

  if (!isEmployee) {
    return <div>Access Denied: Employees only</div>;
  }

  return (
    <Container className="mt-4">
      <h1>Employee Dashboard</h1>
      <p>Welcome, {user?.email || "Employee"}!</p>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Pending Tasks</Card.Title>
          {loading ? (
            <Card.Text>Loading tasks...</Card.Text>
          ) : error ? (
            <Card.Text className="text-danger">{error}</Card.Text>
          ) : (
            <Card.Text>
              You have <strong>{taskCount}</strong> pending{" "}
              {taskCount === 1 ? "task" : "tasks"}!
            </Card.Text>
          )}
          <Button
            variant="primary"
            onClick={() => navigate("/employee-tasks")}
            disabled={loading}
          >
            View Tasks
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EmployeeDashboard;
