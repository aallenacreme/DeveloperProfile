// src/components/EmployeeDashboard.js
import { Container } from "react-bootstrap";
import { useAuth } from "../../auth";

function EmployeeDashboard() {
  const { user, isEmployee } = useAuth();

  if (!isEmployee) {
    return <div>Access Denied: Employees only</div>;
  }

  return (
    <Container>
      <h1>Employee Dashboard</h1>
      <p>Welcome, {user?.email || "Employee"}!</p>
      {/* Add your dashboard content here */}
    </Container>
  );
}

export default EmployeeDashboard;
