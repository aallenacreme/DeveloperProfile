import { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { authFetch, useAuth } from '../auth';

function LoginModal({ show, onHide }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setIsLoggedIn } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authFetch('http://localhost:5000/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setError('');
        localStorage.setItem('token', data.token);
        setIsLoggedIn(true);
        setUsername('');
        setPassword('');
        onHide();
        alert('Login successful!');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleLogin}>
          <Form.Group controlId="formUsername" className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="formPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          {error && <p className="text-danger">{error}</p>}
          <Button variant="primary" type="submit">
            Login
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default LoginModal;