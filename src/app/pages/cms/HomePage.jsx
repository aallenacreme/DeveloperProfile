import { useState, useEffect, useRef } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import axios from 'axios';
import Header from '../../components/Header';
import MainContent from '../../components/MainContent';
import Footer from '../../components/Footer';

function HomePage() {
  const [profileData, setProfileData] = useState({
    name: '',
    headerTitle: 'AllenMahdi',
    headerSubtitle: 'Software Developer',
    collegeProgress: [],
    javaSkills: [],
    sqlSkills: [],
    footerText: '',
    projectTitle: '',
    projectSubtitle: '',
    projectDuration: '',
    projectDescription: '',
    projectDetails: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const aboutSectionRef = useRef(null);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/profile')
      .then((response) => {
        setProfileData(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
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
    return <Container className="text-danger">{error}</Container>;
  }

  return (
    <>
      <Header profileData={profileData} aboutSectionRef={aboutSectionRef} />
      <MainContent profileData={profileData} aboutSectionRef={aboutSectionRef} />
      <Footer />
    </>
  );
}

export default HomePage;