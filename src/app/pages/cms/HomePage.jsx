import { useState, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import axios from 'axios';
import Header from '../../components/Header';
import MainContent from '../../components/MainContent';

function HomePage() {
  const [profileData, setProfileData] = useState({
    name: '',
    collegeProgress: [],
    javaSkills: [],
    sqlSkills: [],
    footerText: '',
    projectTitle: '',
    projectSubtitle: '',
    projectDuration: '',
    projectDescription: '',
    projectDetails: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/profile')
      .then(response => {
        setProfileData(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('API error:', error);
        setError('Failed to load profile data');
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <p className="text-danger">{error}</p>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <MainContent profileData={profileData} />
      {/* Footer */}
      <div className="mt-5 p-4 bg-dark text-white text-center">
        <p>{profileData.footerText || 'Footer'}</p>
      </div>
    </>
  );
}

export default HomePage;