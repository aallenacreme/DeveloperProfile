import { useState, useEffect } from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Header.css';

function Header() {
  const [headerData, setHeaderData] = useState({
    name: '',
    headerTitle: '',
    headerSubtitle: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/profile')
      .then(response => {
        setHeaderData({
          name: response.data.name,
          headerTitle: response.data.headerTitle,
          headerSubtitle: response.data.headerSubtitle
        });
        setIsLoading(false);
      })
      .catch(error => {
        console.error('API error:', error);
        setError('Failed to load header data');
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div>Loading header...</div>;
  }

  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  return (
    <>
      {/* Blue Header Section */}
      <div className="p-5 bg-primary text-white text-center">
        <h1>{headerData.headerTitle || 'My First Bootstrap 5 Page'}</h1>
        <p>{headerData.headerSubtitle || 'Software Developer'}</p>
      </div>

      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" style={{ borderBottom: '2px solid #fff' }}>
        <Container className="d-flex justify-content-between align-items-center">
          <Navbar.Brand>{headerData.name || 'Allen'}</Navbar.Brand>
          <div>
            <Link to="/" style={{ textDecoration: 'none', marginRight: '10px' }}>
              <Button variant="outline-light">Home</Button>
            </Link>
            <Link to="/tenzies" style={{ textDecoration: 'none', marginRight: '10px' }}>
              <Button variant="outline-light">Play Tenzies</Button>
            </Link>
            <a
              href="https://github.com/aallenacreme"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button variant="outline-light">
                <img
                  src="/assets/images/git.svg"
                  alt="GitHub"
                  style={{ width: '24px', height: '24px' }}
                />
              </Button>
            </a>
          </div>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;