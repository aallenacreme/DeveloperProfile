import { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useAuth } from '../auth';

function SignupModal({ show, onHide }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password, username);
      setError('');
      onHide();
    } catch (err) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Sign Up</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSignup}>
          <Form.Group className='mb-3'>
            <Form.Label>Username</Form.Label>
            <Form.Control
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          {error && <p className='text-danger'>{error}</p>}
          <Button type='submit'>Sign Up</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default SignupModal;