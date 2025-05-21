import { useState, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TenziesGame from '../../components/Tenzies/TenziesGame';
import Header from '../../components/Header';


function HomePage() {
  const [showDetails, setShowDetails] = useState(false);
  const [showJavaSkills, setShowJavaSkills] = useState(false);
  const [showSqlSkills, setShowSqlSkills] = useState(false);

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
    <Container
      className="d-flex align-items-start justify-content-center"
      style={{ minHeight: 'calc(100vh - 70px)', paddingTop: '70px', overflow: 'auto' }}
    >
      <Row className="w-100">
        <Col className="text-center">
          <Button variant="primary" onClick={() => setShowDetails(!showDetails)}>
            Who Am I
          </Button>

          {showDetails && (
            <div className="content-block fade-in">
              <p className="mt-3 text-center">
                I'm {profileData.name || 'a student'}, a passionate computer science student and aspiring developer.
              </p>

              <h4 className="text-center">My Progress in College</h4>
              <ListGroup>
                {profileData.collegeProgress.length > 0 ? (
                  profileData.collegeProgress.map((item, index) => (
                    <ListGroup.Item key={index}>{item}</ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item>No progress data available</ListGroup.Item>
                )}
              </ListGroup>

              <Button variant="success" className="mt-3" onClick={() => setShowJavaSkills(!showJavaSkills)}>
                Java Skills
              </Button>
              {showJavaSkills && (
                <ListGroup className="mt-3">
                  {profileData.javaSkills.length > 0 ? (
                    profileData.javaSkills.map((skill, index) => (
                      <ListGroup.Item key={index}>{skill}</ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item>No Java skills available</ListGroup.Item>
                  )}
                </ListGroup>
              )}

              <Button variant="info" className="mt-3" onClick={() => setShowSqlSkills(!showSqlSkills)}>
                SQL Skills
              </Button>
              {showSqlSkills && (
                <ListGroup className="mt-3">
                  {profileData.sqlSkills.length > 0 ? (
                    profileData.sqlSkills.map((skill, index) => (
                      <ListGroup.Item key={index}>{skill}</ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item>No SQL skills available</ListGroup.Item>
                  )}
                </ListGroup>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}


export default HomePage;