// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth";
import TenziesGame from "./components/Tenzies/TenziesGame";
import HomePage from "./pages/cms/HomePage";
import HomepageManagement from "./components/Management/HomepageManagement";
import employeeManagement from "./components/Management/employeeManagement";
import DepartmentManagement from "./components/Management/DepartmentManagement";
import RoleManagement from "./components/Management/RoleManagement";
import "./assets/custom/app.css";
import "./auth";

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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
