import { useState, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import TenziesGame from './components/Tenzies/TenziesGame';
import "./assets/custom/app.css";
import Header from './components/Header';
import HomePage from './pages/cms/HomePage';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/tenzies" element={<TenziesGame />} />
      </Routes>
    </Router>
  );
}

export default App;
