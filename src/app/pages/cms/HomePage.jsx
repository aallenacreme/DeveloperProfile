import { useState, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Spinner, Navbar, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function HomePage() {
  const [profileData, setProfileData] = useState({
    name: '',
    collegeProgress: [],
    javaSkills: [],
    sqlSkills: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/profile')
      .then(response => {
        setProfileData(response.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <>
      {/* Blue Header Section */}
      <div className="p-5 bg-primary text-white text-center">
        <h1>Allen Mahdi</h1>
        <p>Software Developer</p>
      </div>

      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" style={{ borderBottom: '2px solid #fff' }}>
        <Container className="d-flex justify-content-between align-items-center">
          <Navbar.Brand>Allen</Navbar.Brand>
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
                  src="/assets/images/git.svg" // Update to correct path if needed
                  alt="GitHub"
                  style={{ width: '24px', height: '24px' }}
                />
              </Button>
            </a>
          </div>
        </Container>
      </Navbar>

      {/* Content */}
      <Container className="mt-5">
        <Row>
          {/* Sidebar (Profile Data) */}
          <Col sm={4}>
            <h2>About Me</h2>
            <h5>Photo of me:</h5>
            <div className="fakeimg">Fake Image</div>
            <p>I'm {profileData.name || 'a student'}, a passionate computer science student and aspiring developer.</p>
            <h3 className="mt-4">My Progress in College</h3>
            <ListGroup>
              {profileData.collegeProgress.length > 0 ? (
                profileData.collegeProgress.map((item, index) => (
                  <ListGroup.Item key={index}>{item}</ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No progress data available</ListGroup.Item>
              )}
            </ListGroup>
            <h3 className="mt-4">Java Skills</h3>
            <ListGroup>
              {profileData.javaSkills.length > 0 ? (
                profileData.javaSkills.map((skill, index) => (
                  <ListGroup.Item key={index}>{skill}</ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No Java skills available</ListGroup.Item>
              )}
            </ListGroup>
            <h3 className="mt-4">SQL Skills</h3>
            <ListGroup>
              {profileData.sqlSkills.length > 0 ? (
                profileData.sqlSkills.map((skill, index) => (
                  <ListGroup.Item key={index}>{skill}</ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No SQL skills available</ListGroup.Item>
              )}
            </ListGroup>
            <hr className="d-sm-none" />
          </Col>

          {/* Main Content */}
        
        </Row>
      </Container>

      {/* Footer */}
      <div className="mt-5 p-4 bg-dark text-white text-center">
        <p>Footer</p>
      </div>
    </>
  );
}

export default HomePage;