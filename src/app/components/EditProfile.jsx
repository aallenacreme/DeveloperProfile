import { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authFetch, useAuth } from '../auth';

function EditProfile() {
  const { isLoggedIn } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    headerTitle: '',
    headerSubtitle: '',
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authFetch('http://localhost:5000/api/profile');
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        } else {
          setError('Failed to fetch profile');
        }
      } catch (err) {
        setError('Error fetching profile');
      }
    };
    fetchProfile();
  }, [isLoggedIn]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleArrayChange = (e, field, index) => {
    const newArray = [...profileData[field]];
    newArray[index] = e.target.value;
    setProfileData({ ...profileData, [field]: newArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authFetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setError('');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile');
    }
  };

  return (
    <Container className="my-5">
      <h2>Edit Profile</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={profileData.name}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Header Title</Form.Label>
          <Form.Control
            type="text"
            name="headerTitle"
            value={profileData.headerTitle}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Header Subtitle</Form.Label>
          <Form.Control
            type="text"
            name="headerSubtitle"
            value={profileData.headerSubtitle}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>College Progress</Form.Label>
          {profileData.collegeProgress.map((item, index) => (
            <Form.Control
              key={index}
              type="text"
              value={item}
              onChange={(e) => handleArrayChange(e, 'collegeProgress', index)}
              className="mb-2"
            />
          ))}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Project Description</Form.Label>
          <Form.Control
            as="textarea"
            name="projectDescription"
            value={profileData.projectDescription}
            onChange={handleChange}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Save Changes
        </Button>
      </Form>
    </Container>
  );
}

export default EditProfile;