import { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useAuth } from '../auth';
import axiosInstance from './axiosInstance';

function LoginModal({ show, onHide }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setIsLoggedIn } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post('/login', { username, password });
      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
      setError('');
      onHide();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton><Modal.Title>Login</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Form.Group>
          {error && <p className="text-danger">{error}</p>}
          <Button type="submit">Login</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default LoginModal;
