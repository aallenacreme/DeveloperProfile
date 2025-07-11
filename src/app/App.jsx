// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth";
import TenziesGame from "./components/Tenzies/TenziesGame";
import HomePage from "./pages/cms/HomePage";
import HomepageManagement from "./components/Management/HomepageManagement";
import EmployeeManagement from "./components/Management/EmployeeManagement";
import DepartmentManagement from "./components/Management/DepartmentManagement";
import RoleManagement from "./components/Management/RoleManagement";
import EmployeeDashboard from "./components/Worker/EmployeeDashboard";
import TaskManagement from "./components/Management/TaskManagement";
import "./assets/custom/app.css";
import EmployeeTasks from "./components/Worker/EmployeeTasks";
import MessageManagement from "./components/Management/Messages/MessageManagement";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<HomePage />} />
          <Route path="/tenzies" element={<TenziesGame />} />
          <Route path="/homepage-management" element={<HomepageManagement />} />
          <Route path="/employees" element={<EmployeeManagement />} />
          <Route path="/departments" element={<DepartmentManagement />} />
          <Route path="/roles" element={<RoleManagement />} />
          <Route path="/tasks" element={<TaskManagement />} />
          <Route path="/employee-tasks" element={<EmployeeTasks />} />
          <Route path="/messages" element={<MessageManagement />} />
          <Route
            path="/employee-dashboard"
            element={<EmployeeDashboard />}
          />{" "}
          {/* New route */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
