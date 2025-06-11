import { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { axiosAuthInstance } from './axiosInstance'; // 

function EditProfile({ profileData, setProfileData }) {
  const { isLoggedIn } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, field, index) => {
    const newArray = [...profileData[field]];
    newArray[index] = e.target.value;
    setProfileData((prev) => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field) => {
    setProfileData((prev) => ({ 
      ...prev, 
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    const newArray = profileData[field].filter((_, i) => i !== index);
    setProfileData((prev) => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError('You must be logged in to save changes');
      return;
    }
    try {
      await axiosAuthInstance.put('/profile', profileData); // Changed to axiosAuthInstance
      setSuccess('Profile updated successfully!');
      setError('');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <Container className="my-5 edit-profile-container">
      <h2 className="text-gradient mb-4">Edit Profile</h2>
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit} className="profile-form">
        {/* Basic Info Section */}
        <div className="form-section">
          <h4 className="section-title">Basic Information</h4>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleChange}
              disabled={!isLoggedIn}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Header Title</Form.Label>
            <Form.Control
              type="text"
              name="headerTitle"
              value={profileData.headerTitle}
              onChange={handleChange}
              disabled={!isLoggedIn}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Header Subtitle</Form.Label>
            <Form.Control
              type="text"
              name="headerSubtitle"
              value={profileData.headerSubtitle}
              onChange={handleChange}
              disabled={!isLoggedIn}
            />
          </Form.Group>
        </div>

        {/* College Progress Section */}
        <div className="form-section">
          <h4 className="section-title">College Progress</h4>
          {profileData.collegeProgress.map((item, index) => (
            <div key={index} className="array-item-group mb-2">
              <Form.Control
                type="text"
                value={item}
                onChange={(e) => handleArrayChange(e, 'collegeProgress', index)}
                disabled={!isLoggedIn}
              />
              {isLoggedIn && (
                <Button 
                  variant="outline-danger" 
                  onClick={() => removeArrayItem('collegeProgress', index)}
                  className="ms-2"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          {isLoggedIn && (
            <Button 
              variant="outline-primary" 
              onClick={() => addArrayItem('collegeProgress')}
              className="mt-2"
            >
              Add Progress Item
            </Button>
          )}
        </div>

        {/* Skills Sections */}
        <div className="form-section">
          <h4 className="section-title">Java Skills</h4>
          {profileData.javaSkills.map((item, index) => (
            <div key={index} className="array-item-group mb-2">
              <Form.Control
                type="text"
                value={item}
                onChange={(e) => handleArrayChange(e, 'javaSkills', index)}
                disabled={!isLoggedIn}
              />
              {isLoggedIn && (
                <Button 
                  variant="outline-danger" 
                  onClick={() => removeArrayItem('javaSkills', index)}
                  className="ms-2"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          {isLoggedIn && (
            <Button 
              variant="outline-primary" 
              onClick={() => addArrayItem('javaSkills')}
              className="mt-2"
            >
              Add Java Skill
            </Button>
          )}
        </div>

        <div className="form-section">
          <h4 className="section-title">SQL Skills</h4>
          {profileData.sqlSkills.map((item, index) => (
            <div key={index} className="array-item-group mb-2">
              <Form.Control
                type="text"
                value={item}
                onChange={(e) => handleArrayChange(e, 'sqlSkills', index)}
                disabled={!isLoggedIn}
              />
              {isLoggedIn && (
                <Button 
                  variant="outline-danger" 
                  onClick={() => removeArrayItem('sqlSkills', index)}
                  className="ms-2"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          {isLoggedIn && (
            <Button 
              variant="outline-primary" 
              onClick={() => addArrayItem('sqlSkills')}
              className="mt-2"
            >
              Add SQL Skill
            </Button>
          )}
        </div>

        {/* Project Section */}
        <div className="form-section">
          <h4 className="section-title">Project Information</h4>
          <Form.Group className="mb-3">
            <Form.Label>Project Title</Form.Label>
            <Form.Control
              type="text"
              name="projectTitle"
              value={profileData.projectTitle}
              onChange={handleChange}
              disabled={!isLoggedIn}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Project Subtitle</Form.Label>
            <Form.Control
              type="text"
              name="projectSubtitle"
              value={profileData.projectSubtitle}
              onChange={handleChange}
              disabled={!isLoggedIn}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Project Duration</Form.Label>
            <Form.Control
              type="text"
              name="projectDuration"
              value={profileData.projectDuration}
              onChange={handleChange}
              disabled={!isLoggedIn}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Project Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="projectDescription"
              value={profileData.projectDescription}
              onChange={handleChange}
              disabled={!isLoggedIn}
            />
          </Form.Group>

          <h5 className="mt-4">Project Details</h5>
          {profileData.projectDetails.map((item, index) => (
            <div key={index} className="array-item-group mb-2">
              <Form.Control
                as="textarea"
                rows={2}
                value={item}
                onChange={(e) => handleArrayChange(e, 'projectDetails', index)}
                disabled={!isLoggedIn}
              />
              {isLoggedIn && (
                <Button 
                  variant="outline-danger" 
                  onClick={() => removeArrayItem('projectDetails', index)}
                  className="ms-2"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          {isLoggedIn && (
            <Button 
              variant="outline-primary" 
              onClick={() => addArrayItem('projectDetails')}
              className="mt-2"
            >
              Add Project Detail
            </Button>
          )}
        </div>

        {/* Footer Section */}
        <div className="form-section">
          <h4 className="section-title">Footer Text</h4>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              name="footerText"
              value={profileData.footerText}
              onChange={handleChange}
              disabled={!isLoggedIn}
            />
          </Form.Group>
        </div>

        {isLoggedIn && (
          <div className="form-actions mt-4">
            <Button variant="primary" type="submit" className="me-2">
              Save Changes
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              Cancel
            </Button>
          </div>
        )}
      </Form>
    </Container>
  );
}

export default EditProfile;