import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TenziesGame from './components/Tenzies/TenziesGame';
import HomePage from './pages/cms/HomePage';
import Login from './components/Login';
import './assets/custom/app.css';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/tenzies" element={<ProtectedRoute><TenziesGame /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

export default App;